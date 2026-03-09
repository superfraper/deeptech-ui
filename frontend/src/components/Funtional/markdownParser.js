import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import styles from './styles';

// Function to detect if content is JSON table data
const isJSONTableData = content => {
  try {
    const parsed = JSON.parse(content.trim());
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === 'object' &&
      parsed[0] !== null
    );
  } catch {
    return false;
  }
};

// Detect and structure lists while preserving original markers
function normalizeBullet(m) {
  const map = { '●': '•', '○': '•', '◦': '•' };
  // If it's a single character and not mapped, keep as-is; otherwise fallback to '-'
  if (typeof m === 'string' && m.length === 1) return map[m] || m;
  return '-';
}
const parseLinesWithLists = text => {
  const lines = text.split(/\r?\n/);
  const items = [];
  const listRegex =
    /^(\s*)([-*+\u2022\u2023\u2043\u204C\u204D\u2219\u25CF\u25D8\u25E6\u2619\u2765\u2767|\d+[.]|[a-zA-Z][.])\s+(.*)$/;

  for (const line of lines) {
    const m = line.match(listRegex);
    if (m) {
      const [, indent, marker, content] = m;
      const normMarker = normalizeBullet(marker);
      items.push({
        type: 'list',
        level: Math.floor((indent || '').length / 2),
        marker: normMarker,
        content,
      });
    } else if (line.trim() === '') {
      items.push({ type: 'blank' });
    } else {
      items.push({ type: 'text', text: line });
    }
  }
  return items;
};

const renderLines = items => {
  return (
    <View>
      {items.map((it, idx) => {
        if (it.type === 'text') {
          return (
            <Text key={idx} style={styles.text}>
              {it.text}
            </Text>
          );
        }
        if (it.type === 'blank') {
          return (
            <Text key={idx} style={styles.text}>
              {' '}
            </Text>
          );
        }
        if (it.type === 'list') {
          const pad = 10 + (it.level || 0) * 12;
          return (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                marginBottom: 3,
                paddingLeft: pad,
              }}
            >
              <Text style={[styles.text, { width: 14 }]}>{it.marker}</Text>
              <Text style={[styles.text, { flex: 1 }]}>{it.content}</Text>
            </View>
          );
        }
        return null;
      })}
    </View>
  );
};

// Function to render JSON table data as a table
const renderJSONTable = jsonData => {
  try {
    const data = JSON.parse(jsonData);
    if (!Array.isArray(data) || data.length === 0) return null;
    const headers = Object.keys(data[0]);

    return (
      <View style={styles.tableContainer}>
        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          {headers.map((header, index) => (
            <View
              key={index}
              style={[
                styles.tableColAuto,
                index === headers.length - 1 ? { borderRightWidth: 1 } : {},
              ]}
            >
              <Text style={styles.text}>{header}</Text>
            </View>
          ))}
        </View>

        {/* Table rows */}
        {data.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {headers.map((header, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.tableColAuto,
                  colIndex === headers.length - 1
                    ? { borderRightWidth: 1 }
                    : {},
                ]}
              >
                <Text style={styles.text}>{row[header] || ''}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  } catch (error) {
    console.error('Error rendering JSON table:', error);
    return <Text style={styles.text}>{jsonData}</Text>;
  }
};

const renderMarkdownTable = content => {
  const lines = content.trim().split('\n');
  const tableLines = lines.filter(line => line.trim().startsWith('|'));

  if (tableLines.length < 2) return null;
  const headerCells = tableLines[0]
    .slice(1, -1)
    .split('|')
    .map(cell => cell.trim());
  const dataRows = tableLines.slice(2).map(line =>
    line
      .slice(1, -1)
      .split('|')
      .map(cell => cell.trim())
  );

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {headerCells.map((header, index) => (
          <View
            key={index}
            style={[
              styles.tableColAuto,
              index === headerCells.length - 1 ? { borderRightWidth: 1 } : {},
            ]}
          >
            <Text style={styles.text}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data rows */}
      {dataRows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tableRow}>
          {row.map((cell, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.tableColAuto,
                colIndex === row.length - 1 ? { borderRightWidth: 1 } : {},
              ]}
            >
              <Text style={styles.text}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export const ContentRenderer = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <Text style={styles.text}></Text>;
  }
  const processedContent = content.trim();

  if (isJSONTableData(processedContent)) {
    return renderJSONTable(processedContent);
  }

  if (
    processedContent.includes('|') &&
    processedContent.split('\n').some(line => line.trim().startsWith('|'))
  ) {
    const tableResult = renderMarkdownTable(processedContent);
    if (tableResult) return tableResult;
  }

  // Render plain text and lists preserving markers
  const structured = parseLinesWithLists(processedContent);
  return renderLines(structured);
};

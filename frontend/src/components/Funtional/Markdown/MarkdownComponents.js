import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import styles from '../styles';
import { parseMarkdownTable, parseBulletPoints } from './parseUtils';

// Component to render a markdown table
export const MarkdownTable = ({ content }) => {
  const tableData = parseMarkdownTable(content);

  if (!tableData) {
    return <Text style={styles.text}>{content}</Text>;
  }

  const { headers, rows } = tableData;

  // Calculate column widths based on content length
  const totalColumns = headers.length;
  const colWidths = Array(totalColumns).fill(0);

  // Measure header lengths
  headers.forEach((header, idx) => {
    colWidths[idx] = Math.max(colWidths[idx], header.length);
  });

  // Measure data lengths
  rows.forEach(row => {
    row.forEach((cell, idx) => {
      colWidths[idx] = Math.max(colWidths[idx], cell.length);
    });
  });

  // Convert to percentage
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  const widthPercentages = colWidths.map(
    width => Math.max(5, Math.min(60, (width / totalWidth) * 100)) + '%'
  );

  return (
    <>
      <View style={styles.tableSingle} wrap={false}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          {headers.map((header, index) => (
            <View
              key={index}
              style={{
                width: widthPercentages[index],
                padding: 8,
                borderRightWidth: index < headers.length - 1 ? 1 : 0,
                borderRightColor: '#000',
                backgroundColor: '#f0f0f0',
              }}
            >
              <Text style={[styles.text, { fontWeight: 'bold' }]}>
                {header}
              </Text>
            </View>
          ))}
        </View>

        {/* Table rows */}
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.tableRow,
              { borderTopColor: '#000', borderTopWidth: 1 }, // Always add top border for consistent appearance
              rowIndex === rows.length - 1
                ? {}
                : { borderBottomWidth: 1, borderBottomColor: '#000' },
            ]}
          >
            {row.map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={{
                  width: widthPercentages[cellIndex],
                  padding: 8,
                  borderRightWidth: cellIndex < headers.length - 1 ? 1 : 0,
                  borderRightColor: '#000',
                }}
              >
                <Text style={styles.text}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </>
  );
};

// Component to render bullet points
export const BulletPointsList = ({ points }) => {
  return (
    <>
      {points.map((point, index) => (
        <View key={index} style={styles.bulletPoint}>
          {point.indentation > 0 ? (
            <>
              <Text style={{ ...styles.bullet, marginLeft: 10 }}>- </Text>
              <Text style={styles.bulletContent}>{point.text}</Text>
            </>
          ) : (
            <>
              <Text style={styles.bullet}>- </Text>
              <Text style={styles.bulletContent}>{point.text}</Text>
            </>
          )}
        </View>
      ))}
    </>
  );
};

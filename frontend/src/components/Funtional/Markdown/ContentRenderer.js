import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import styles from '../styles';
import { MarkdownTable, BulletPointsList } from './MarkdownComponents';
import {
  parseMarkdownTable,
  parseBulletPoints,
  parseHeaders,
  parseBoldText,
} from './parseUtils';

// Process text to replace special bullet point characters
const preprocessBulletPoints = text => {
  if (!text) return text;

  // Replace bullet point characters with hyphens
  let processed = text
    .replace(/●\s*/g, '- ') // Replace full bullets with hyphen
    .replace(/○\s*/g, '  - ') // Replace empty bullets with indented hyphen
    .replace(/•\s*/g, '- ') // Also handle HTML bullet
    .replace(/◦\s*/g, '  - ') // Also handle alternative empty bullet
    .replace(
      /[\u2022\u2023\u2043\u204C\u204D\u2219\u25D8\u25E6\u2619\u2765\u2767]\s*/g,
      '- '
    ); // Handle other bullet variants

  return processed;
};

// Process and render formatted content (handles markdown elements)
export const ContentRenderer = ({ content }) => {
  if (!content) return null;

  // Preprocess content to handle bullet points
  const processedContent = preprocessBulletPoints(content);

  // Split content by lines to handle headers followed by other content
  const lines = processedContent.split('\n');
  const firstLine = lines[0];

  // Check if first line is a header and handle the rest of the content separately
  if (firstLine.trim().startsWith('### ')) {
    const headerText = firstLine.trim().replace(/^### /, '');
    const remainingContent = lines.slice(1).join('\n').trim();

    return (
      <>
        <Text style={styles.markdownHeader}>{headerText}</Text>
        <View style={{ marginTop: 8 }}></View> {/* Add spacing after header */}
        {remainingContent && <ContentRenderer content={remainingContent} />}
      </>
    );
  }

  // Check if entire content is wrapped in bold markers
  if (content.trim().startsWith('**') && content.trim().endsWith('**')) {
    return (
      <Text style={styles.boldText}>
        {content.trim().replace(/^\*\*|\*\*$/g, '')}
      </Text>
    );
  }

  // Check for markdown table
  if (content.includes('|')) {
    const tableData = parseMarkdownTable(content);
    if (tableData) {
      return <MarkdownTable content={content} />;
    }
  }

  // Check for bullet points
  const bulletPoints = parseBulletPoints(content);
  if (bulletPoints) {
    const nonBulletContent = content
      .split('\n')
      .filter(line => !line.trim().startsWith('- '))
      .join('\n');

    return (
      <>
        {nonBulletContent && (
          <Text style={styles.text}>{nonBulletContent.trim()}</Text>
        )}
        <BulletPointsList points={bulletPoints} />
      </>
    );
  }

  // Process text with mixed formatting
  const boldMatches = parseBoldText(content);
  const headerMatches = parseHeaders(content);

  if (boldMatches || headerMatches) {
    // If we have bold text or headers mixed with regular text, we need to split and render each part
    let parts = [{ text: content, type: 'regular' }];

    // Process bold text
    if (boldMatches) {
      let newParts = [];

      for (const part of parts) {
        if (part.type !== 'regular') {
          newParts.push(part);
          continue;
        }

        let lastIndex = 0;
        let currentText = part.text;

        for (const match of boldMatches) {
          // Add text before the bold part
          if (match.index > lastIndex) {
            newParts.push({
              text: currentText.substring(lastIndex, match.index),
              type: 'regular',
            });
          }

          // Add the bold part
          newParts.push({
            text: match.boldText,
            type: 'bold',
          });

          lastIndex = match.index + match.fullMatch.length;
        }

        // Add remaining text after last bold part
        if (lastIndex < currentText.length) {
          newParts.push({
            text: currentText.substring(lastIndex),
            type: 'regular',
          });
        }
      }

      parts = newParts;
    }

    // Process headers
    if (headerMatches) {
      let newParts = [];

      for (const part of parts) {
        if (part.type !== 'regular') {
          newParts.push(part);
          continue;
        }

        let lastIndex = 0;
        let currentText = part.text;

        for (const match of headerMatches) {
          // Add text before the header
          if (match.index > lastIndex) {
            newParts.push({
              text: currentText.substring(lastIndex, match.index),
              type: 'regular',
            });
          }

          // Add the header (without ### prefix)
          newParts.push({
            text: match.text,
            type: 'header',
          });

          lastIndex = match.index + match.text.length + 4; // 4 for the '### ' prefix
        }

        // Add remaining text after last header
        if (lastIndex < currentText.length) {
          newParts.push({
            text: currentText.substring(lastIndex),
            type: 'regular',
          });
        }
      }

      parts = newParts;
    }

    // Render all parts with appropriate styling
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'bold') {
            return (
              <Text key={index} style={styles.boldText}>
                {part.text}
              </Text>
            );
          } else if (part.type === 'header') {
            return (
              <Text key={index} style={styles.markdownHeader}>
                {part.text}
              </Text>
            );
          } else {
            return (
              <Text key={index} style={styles.text}>
                {part.text}
              </Text>
            );
          }
        })}
      </>
    );
  }

  // Render as regular text with line breaks
  const textLines = processedContent.split('\n');
  return (
    <>
      {textLines.map((line, index) => (
        <Text key={index} style={styles.contentRow}>
          {line}
        </Text>
      ))}
    </>
  );
};

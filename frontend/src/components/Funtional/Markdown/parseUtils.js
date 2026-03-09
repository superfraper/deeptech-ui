// Parse markdown tables from content
export const parseMarkdownTable = content => {
  if (!content || typeof content !== 'string') return null;

  // Check if content contains a markdown table
  if (!content.includes('|') && !content.includes('\n')) return null;

  try {
    // Handle table formats with or without proper markdown formatting
    let lines = content.split('\n').map(line => line.trim());

    // First, try to handle tables that aren't properly formatted with pipe characters
    if (content.includes('\n') && !content.startsWith('|')) {
      // Check if it might be a space-delimited table (like "Name Address Activity")
      const potentialHeaderRow = lines[0];
      if (potentialHeaderRow && potentialHeaderRow.includes(' ')) {
        // Try to identify column headers by looking for multiple spaces or |
        let headerParts = potentialHeaderRow
          .split(/\s{2,}|\|/)
          .filter(part => part.trim().length > 0);

        if (headerParts.length >= 2) {
          // Reconstruct as markdown table
          const reconstructedLines = [];
          reconstructedLines.push('| ' + headerParts.join(' | ') + ' |');
          reconstructedLines.push(
            '| ' + headerParts.map(() => '---').join(' | ') + ' |'
          );

          // Add data rows
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              // Split by multiple spaces or |
              let rowParts = lines[i]
                .split(/\s{2,}|\|/)
                .filter(part => part.trim().length > 0);

              if (rowParts.length > 0) {
                // Ensure we have enough columns
                while (rowParts.length < headerParts.length) {
                  rowParts.push('');
                }
                reconstructedLines.push('| ' + rowParts.join(' | ') + ' |');
              }
            }
          }

          lines = reconstructedLines;
        }
      }
    }

    // Now process as a standard markdown table
    const tableLines = lines.filter(
      line =>
        line.trim().length > 0 && (line.includes('|') || line.includes('-'))
    );

    if (tableLines.length < 2) return null;

    // Extract headers from first line
    const headerRow = tableLines[0];
    let headers = headerRow
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);

    if (headers.length === 0 && headerRow.includes(' ')) {
      // Try splitting by spaces if no pipe characters
      headers = headerRow.split(/\s{2,}/).filter(h => h.trim());
    }

    // Skip separator row if present
    let startRowIndex = 1;
    if (
      tableLines.length > 1 &&
      (tableLines[1].replace(/[^|\-:]/g, '').length ===
        tableLines[1].trim().length ||
        tableLines[1].includes('---'))
    ) {
      startRowIndex = 2;
    }

    // Parse rows
    const rows = [];
    for (let i = startRowIndex; i < tableLines.length; i++) {
      const line = tableLines[i];
      let rowCells = [];

      if (line.includes('|')) {
        rowCells = line
          .split('|')
          .map(cell => cell.trim())
          .filter((cell, index) => index > 0 || cell.length > 0); // Keep empty cells in the middle
      } else if (line.trim().length > 0) {
        // Try to handle space-delimited rows
        rowCells = line.split(/\s{2,}/).filter(c => c !== undefined);
      }

      if (rowCells.length > 0) {
        // Ensure the row has the same number of cells as headers
        if (rowCells.length < headers.length) {
          while (rowCells.length < headers.length) {
            rowCells.push('');
          }
        }
        rows.push(rowCells.slice(0, headers.length));
      }
    }

    return { headers, rows };
  } catch (error) {
    console.error('Error parsing markdown table:', error);
    return null;
  }
};

// Parse bullet points from content
export const parseBulletPoints = content => {
  if (!content || typeof content !== 'string') return null;

  // Check if content contains bullet points - now handling hyphens and original bullets
  const bulletPointRegex = /^(-|●|○|•|◦)\s+(.+)$/gm;
  const matches = content.match(bulletPointRegex);

  if (!matches) return null;

  // Extract bullet points
  const bulletPoints = [];
  let match;
  const regex = new RegExp(bulletPointRegex);

  while ((match = regex.exec(content)) !== null) {
    // Get the bullet symbol to determine indentation
    const bulletSymbol = match[1];
    const text = match[2].trim();

    // Add indentation information
    bulletPoints.push({
      text,
      indentation:
        bulletSymbol === '○' ||
        bulletSymbol === '◦' ||
        (bulletSymbol === '-' && match[0].startsWith('  -'))
          ? 1
          : 0,
    });
  }

  return bulletPoints.length > 0 ? bulletPoints : null;
};

// Parse headers from content
export const parseHeaders = content => {
  if (!content || typeof content !== 'string') return null;

  // Check if content contains headers (lines starting with ###)
  const headerRegex = /^###\s+(.+)$/gm;
  const matches = content.match(headerRegex);

  if (!matches) return null;

  // Extract headers
  const headers = [];
  let match;
  const regex = new RegExp(headerRegex);

  while ((match = regex.exec(content)) !== null) {
    headers.push({
      text: match[1].trim(),
      index: match.index,
    });
  }

  return headers.length > 0 ? headers : null;
};

// Parse bold text from content
export const parseBoldText = content => {
  if (!content || typeof content !== 'string') return null;

  // Extract text surrounded by ** (bold)
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const matches = [];
  let match;

  while ((match = boldRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      boldText: match[1],
      index: match.index,
    });
  }

  return matches.length > 0 ? matches : null;
};

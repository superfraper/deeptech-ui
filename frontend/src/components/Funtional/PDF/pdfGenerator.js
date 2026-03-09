import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { PDFDocument } from './pdfDocumentTemplate';

import {
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { sectionISubsections } from './pdfDocumentTemplate';

// Helper: get compliance/summary ranges for section I based on contextType
const getSectionIRanges = contextType => {
  if (contextType === 'EMT') {
    return { compliance: [0, 4], summary: [5, 10] };
  }
  if (contextType === 'ART') {
    return { compliance: [0, 3], summary: [4, 7] };
  }
  // OTH or fallback
  return { compliance: [0, 6], summary: [7, 10] };
};

// Generate and save PDF
export const generateAndSavePDF = async (
  formData,
  allSectionsData,
  contextType = 'OTH'
) => {
  // Group data by section (A, B, C, AA, etc.)
  const groupedData = {};
  Object.entries(allSectionsData).forEach(([key, value]) => {
    // Extract section letter (A, B, C, AA, etc.)
    let sectionLetter = key.split('.')[0];

    if (sectionLetter === 'S') {
      sectionLetter = 'J';
    }

    if (!groupedData[sectionLetter]) {
      groupedData[sectionLetter] = [];
    }
    groupedData[sectionLetter].push({ key, value });
  });

  // Sort items within each section by their key
  Object.keys(groupedData).forEach(section => {
    groupedData[section].sort((a, b) => {
      if (section === 'J') {
        const keyA = a.key;
        const keyB = b.key;

        if (keyA.startsWith('J.') && keyB.startsWith('S.')) return -1;
        if (keyA.startsWith('S.') && keyB.startsWith('J.')) return 1;

        if (keyA.startsWith('S.') && keyB.startsWith('S.')) {
          const numA = parseInt(keyA.split('.')[1]);
          const numB = parseInt(keyB.split('.')[1]);
          return numA - numB;
        }

        return keyA.localeCompare(keyB);
      }

      // Extract the number part from keys like "A.1", "I.02", "AA.1", etc.
      const numA = a.key.split('.')[1];
      const numB = b.key.split('.')[1];

      // Handle numeric sorting with leading zeros
      if (numA && numB) {
        if (numA.length === numB.length) {
          return numA.localeCompare(numB);
        } else {
          // Try to parse as integers if possible
          const intA = parseInt(numA);
          const intB = parseInt(numB);
          return intA - intB;
        }
      }

      // Fallback to string comparison
      return a.key.localeCompare(b.key);
    });
  });

  // Extract subsection items for I.XX (compliance/summary/risk) based on contextType
  let complianceItems = [];
  let summaryItems = [];
  let riskItems = [];

  if (groupedData['I']) {
    const { compliance, summary } = getSectionIRanges(contextType);
    groupedData['I'].forEach(item => {
      const itemNum = item.key.split('.')[1];

      if (contextType === 'OTH') {
        if (/^0\d$|^10$/.test(itemNum)) {
          const itemNumInt = parseInt(itemNum, 10);
          if (itemNumInt >= compliance[0] && itemNumInt <= compliance[1]) {
            complianceItems.push(item);
          } else if (itemNumInt >= summary[0] && itemNumInt <= summary[1]) {
            summaryItems.push(item);
          }
        } else {
          riskItems.push(item);
        }
      } else {
        const itemNumInt = parseInt(itemNum, 10);
        if (!isNaN(itemNumInt) && itemNum.length <= 2) {
          if (itemNumInt >= compliance[0] && itemNumInt <= compliance[1]) {
            complianceItems.push(item);
          } else if (itemNumInt >= summary[0] && itemNumInt <= summary[1]) {
            summaryItems.push(item);
          } else {
            riskItems.push(item);
          }
        } else {
          riskItems.push(item);
        }
      }
    });

    // Only keep riskItems in groupedData['I']
    groupedData['I'] = riskItems;
  }

  try {
    // Generate PDF blob and save

    const blob = await pdf(
      <PDFDocument
        formData={formData}
        sectionsData={groupedData}
        complianceItems={complianceItems}
        summaryItems={summaryItems}
        contextType={contextType}
      />
    ).toBlob();

    const fileName = `${formData.whitepaperType}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

const sectionTitles = {
  OTH: {
    A: 'Information about the offeror or the person seeking admission to trading',
    B: 'Information about the issuer, if different from the offeror or person seeking admission to trading',
    C: 'Information about the operator of the trading platform in cases where it draws up the crypto-asset white paper and information about other persons drawing the crypto-asset white paper pursuant to Article 6(1), second subparagraph, of Regulation (EU) 2023/1114',
    D: 'Information about the crypto-asset project',
    E: 'Information about the offer to the public of crypto-assets or their admission to trading',
    F: 'Information about the crypto-assets',
    G: 'Information on the rights and obligations attached to the crypto-assets',
    H: 'Information on the underlying technology',
    I: 'Information on risks',
    J: 'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
  },
  ART: {
    A: 'Information about the issuer of the asset-referenced token',
    AA: 'Information on other persons offering to the public or seeking admission to trading of asset-referenced tokens',
    B: 'Information about the asset-referenced token',
    C: 'Information about the offer to the public of the asset-referenced token or its admission to trading',
    D: 'Information on the rights and obligations attached to the asset-referenced token',
    E: 'Information on the underlying technology',
    F: 'Information on the risks',
    G: 'Information on the reserve of assets',
    H: 'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
  },
  EMT: {
    A: 'Information about the issuer of the e-money token',
    B: 'Information about the e-money token',
    C: 'Information about the offer to the public of the e-money token or its admission to trading',
    D: 'Information on the rights and obligations attached to e-money tokens',
    E: 'Information on the underlying technology',
    F: 'Information on the risks',
    G: 'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
  },
};

// Generate and save DOCX
// Helper: fetch image as ArrayBuffer for docx header/footer
async function fetchImageBuffer(url) {
  const response = await fetch(url);
  return await response.arrayBuffer();
}

export const generateAndSaveDOCX = async (
  formData,
  allSectionsData,
  contextType = 'OTH'
) => {
  // Group data by section (A, B, C, AA, etc.)
  const groupedData = {};
  Object.entries(allSectionsData).forEach(([key, value]) => {
    let sectionLetter = key.split('.')[0];
    if (sectionLetter === 'S') sectionLetter = 'J';
    if (!groupedData[sectionLetter]) groupedData[sectionLetter] = [];
    groupedData[sectionLetter].push({ key, value });
  });

  // --- Extract token name for title page (match PDF logic) ---
  let tokenName = formData?.cryptoAssetName || 'Crypto Asset';
  if (!formData?.cryptoAssetName) {
    if (contextType === 'OTH') {
      const d2Item = groupedData?.D?.find(item => item.key === 'D.2');
      tokenName = d2Item?.value?.field_text || 'Crypto Asset';
    } else if (contextType === 'ART') {
      const b1Item = groupedData?.B?.find(item => item.key === 'B.1');
      tokenName = b1Item?.value?.field_text || 'Asset-referenced token';
    } else if (contextType === 'EMT') {
      const b1Item = groupedData?.B?.find(item => item.key === 'B.1');
      tokenName = b1Item?.value?.field_text || 'E-money token';
    }
  }

  // Sort items within each section by their key (same as PDF logic)
  Object.keys(groupedData).forEach(section => {
    groupedData[section].sort((a, b) => {
      if (section === 'J') {
        const keyA = a.key;
        const keyB = b.key;
        if (keyA.startsWith('J.') && keyB.startsWith('S.')) return -1;
        if (keyA.startsWith('S.') && keyB.startsWith('J.')) return 1;
        if (keyA.startsWith('S.') && keyB.startsWith('S.')) {
          const numA = parseInt(keyA.split('.')[1]);
          const numB = parseInt(keyB.split('.')[1]);
          return numA - numB;
        }
        return keyA.localeCompare(keyB);
      }
      const numA = a.key.split('.')[1];
      const numB = b.key.split('.')[1];
      if (numA && numB) {
        if (numA.length === numB.length) {
          return numA.localeCompare(numB);
        } else {
          const intA = parseInt(numA);
          const intB = parseInt(numB);
          return intA - intB;
        }
      }
      return a.key.localeCompare(b.key);
    });
  });

  // --- Extract compliance/summary/risk for section I (as in PDF) ---
  let complianceItems = [];
  let summaryItems = [];
  let riskItems = [];
  if (groupedData['I']) {
    const { compliance, summary } = getSectionIRanges(contextType);
    groupedData['I'].forEach(item => {
      const itemNum = item.key.split('.')[1];
      if (contextType === 'OTH') {
        if (/^0\d$|^10$/.test(itemNum)) {
          const itemNumInt = parseInt(itemNum, 10);
          if (itemNumInt >= compliance[0] && itemNumInt <= compliance[1]) {
            complianceItems.push(item);
          } else if (itemNumInt >= summary[0] && itemNumInt <= summary[1]) {
            summaryItems.push(item);
          }
        } else {
          riskItems.push(item);
        }
      } else {
        const itemNumInt = parseInt(itemNum, 10);
        if (!isNaN(itemNumInt) && itemNum.length <= 2) {
          if (itemNumInt >= compliance[0] && itemNumInt <= compliance[1]) {
            complianceItems.push(item);
          } else if (itemNumInt >= summary[0] && itemNumInt <= summary[1]) {
            summaryItems.push(item);
          } else {
            riskItems.push(item);
          }
        } else {
          riskItems.push(item);
        }
      }
    });
    // Only keep riskItems in groupedData['I']
    groupedData['I'] = riskItems;
  }

  // --- Build DOCX document: compliance, summary, A-H (bez I), Part I (risk), reszta (bez I, bez A-H) ---
  const docSections = [];
  const currentSectionTitles = sectionTitles[contextType] || sectionTitles.OTH;
  const currentSectionISubsections =
    sectionISubsections[contextType] || sectionISubsections.OTH;

  // Funkcja pomocnicza do generowania sekcji z pageBreakBefore tylko od drugiej sekcji
  let isFirstSection = true;
  function pushSection(headerText, sectionItems) {
    docSections.push(
      new Paragraph({
        text: headerText,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
        font: 'Manrope',
        ...(isFirstSection ? {} : { pageBreakBefore: true }),
      })
    );
    docSections.push(createSectionTable(sectionItems));
    docSections.push(new Paragraph({ text: '', font: 'Manrope' }));
    isFirstSection = false;
  }

  // 1. Compliance
  if (complianceItems.length > 0) {
    pushSection(currentSectionISubsections['00-06'], complianceItems);
  }
  // 2. Summary
  if (summaryItems.length > 0) {
    pushSection(currentSectionISubsections['07-10'], summaryItems);
  }
  // 3. Sekcje A-H (bez I), with special handling for ART (AA after A)
  let AHSections = [];
  if (contextType === 'ART') {
    // For ART: A, AA, B, C, D, E, F, G, H (skip I)
    AHSections = ['A', 'AA', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  } else {
    // For others: A-H (skip I)
    AHSections = Object.keys(currentSectionTitles)
      .filter(section => /^[A-H]$/.test(section) && section !== 'I')
      .sort();
  }
  AHSections.forEach(section => {
    if (!groupedData[section] || groupedData[section].length === 0) return;
    pushSection(
      `${section}. ${currentSectionTitles[section] || ''}`,
      groupedData[section]
    );
  });
  // 4. Part I (risk)
  if (groupedData['I'] && groupedData['I'].length > 0) {
    pushSection(currentSectionISubsections['rest'], groupedData['I']);
  }
  // 5. Pozostałe sekcje (bez I, bez A-H)
  Object.keys(currentSectionTitles)
    .filter(section => section !== 'I' && !AHSections.includes(section))
    .sort()
    .forEach(section => {
      if (!groupedData[section] || groupedData[section].length === 0) return;
      pushSection(
        `${section}. ${currentSectionTitles[section] || ''}`,
        groupedData[section]
      );
    });
  // A4: 8.27 x 11.69 inches, 1 inch = 96px, 1 inch = 1440 twips
  const PAGE_WIDTH_INCH = 8.27;
  const PAGE_HEIGHT_INCH = 11.69;
  const MARGIN_INCH = 0.5; // 0.5 inch margin for more space
  const PX_PER_INCH = 96;
  const TWIP_PER_INCH = 1440;
  const pageWidthTwip = PAGE_WIDTH_INCH * TWIP_PER_INCH;
  const pageHeightTwip = PAGE_HEIGHT_INCH * TWIP_PER_INCH;
  const marginTwip = MARGIN_INCH * TWIP_PER_INCH;
  // FULL PAGE WIDTH (no margins)
  const fullPageWidthPx = Math.round(PAGE_WIDTH_INCH * PX_PER_INCH);
  const headerFooterImgHeightPx = 50; // keep as before, or adjust as needed

  // Prepare header/footer images (base64)
  let headerImgBuffer = null;
  let footerImgBuffer = null;
  try {
    headerImgBuffer = await fetchImageBuffer('/header.jpg');
    footerImgBuffer = await fetchImageBuffer('/footer.jpg');
  } catch (e) {
    console.warn('Could not load header/footer images for DOCX:', e);
  }

  // Helper: create a table for a whole section
  // Helper: render JSON table as docx Table
  function renderJSONTableDocx(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch {
      return [new Paragraph({ text: jsonString, font: 'Manrope' })];
    }
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      typeof data[0] !== 'object'
    ) {
      return [new Paragraph({ text: jsonString, font: 'Manrope' })];
    }
    const headers = Object.keys(data[0]);
    const cellMargins = { top: 100, bottom: 100, left: 100, right: 100 };
    const headerRow = new TableRow({
      children: headers.map(
        h =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: h, bold: true, font: 'Manrope' }),
                ],
                font: 'Manrope',
              }),
            ],
            margins: cellMargins,
          })
      ),
    });
    const dataRows = data.map(
      row =>
        new TableRow({
          children: headers.map(
            h =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(row[h] ?? ''),
                        font: 'Manrope',
                      }),
                    ],
                    font: 'Manrope',
                  }),
                ],
                margins: cellMargins,
              })
          ),
        })
    );
    return [
      new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: 'pct' },
        margins: { top: 20, bottom: 20 },
      }),
    ];
  }

  // Helper: render markdown table as docx Table
  function renderMarkdownTableDocx(content) {
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
    const cellMargins = { top: 100, bottom: 100, left: 100, right: 100 };
    const headerRow = new TableRow({
      children: headerCells.map(
        h =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: h, bold: true, font: 'Manrope' }),
                ],
                font: 'Manrope',
              }),
            ],
            margins: cellMargins,
          })
      ),
    });
    const docxDataRows = dataRows.map(
      row =>
        new TableRow({
          children: row.map(
            cell =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: cell, font: 'Manrope' })],
                    font: 'Manrope',
                  }),
                ],
                margins: cellMargins,
              })
          ),
        })
    );
    return [
      new Table({
        rows: [headerRow, ...docxDataRows],
        width: { size: 100, type: 'pct' },
        margins: { top: 20, bottom: 20 },
      }),
    ];
  }

  // Helper: check if string is JSON table
  function isJSONTableData(content) {
    try {
      const parsed = JSON.parse(content.trim());
      return (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === 'object'
      );
    } catch {
      return false;
    }
  }

  // Helper function to format field ID for display
  function formatFieldIdForDisplay(fieldId, contextType) {
    if (contextType === 'OTH' && fieldId && fieldId.startsWith('I.')) {
      return fieldId.replace('I.', '');
    }
    return fieldId;
  }

  function createSectionTable(sectionItems, sectionContextType = contextType) {
    const cellMargins = { top: 100, bottom: 100, left: 200, right: 200 };
    // Compute available page width with assumed A4 and 0.5" margins to ensure Google Docs respects widths
    const PAGE_WIDTH_INCH = 8.27;
    const MARGIN_INCH = 0.5;
    const TWIP_PER_INCH = 1440;
    const contentWidthTwip = Math.round(
      (PAGE_WIDTH_INCH - 2 * MARGIN_INCH) * TWIP_PER_INCH
    ); // ~10469 twips
    // Column widths tuned for readability in Google Docs
    const nColWidth = 1600; // ~1.1"
    const fieldColWidth = 3200; // ~2.2"
    const contentColWidth = Math.max(
      0,
      contentWidthTwip - nColWidth - fieldColWidth
    ); // rest
    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'N', bold: true, font: 'Manrope' }),
              ],
              font: 'Manrope',
            }),
          ],
          width: { size: nColWidth, type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Field', bold: true, font: 'Manrope' }),
              ],
              font: 'Manrope',
            }),
          ],
          width: { size: fieldColWidth, type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Content', bold: true, font: 'Manrope' }),
              ],
              font: 'Manrope',
            }),
          ],
          width: { size: contentColWidth, type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.TOP,
        }),
      ],
    });
    const dataRows = sectionItems.map(item => {
      let fieldKey = item.key;
      let fieldName = '';
      let fieldContent = '';
      if (item.value && typeof item.value === 'object') {
        fieldName = item.value.field_name || '';
        fieldContent = item.value.field_text || '';
      } else {
        fieldContent = String(item.value);
      }

      // Format field key for display based on context type
      const displayFieldKey = formatFieldIdForDisplay(
        fieldKey,
        sectionContextType
      );

      // Render table if content is JSON table or markdown table
      let contentChildren = [];
      if (typeof fieldContent === 'string' && isJSONTableData(fieldContent)) {
        contentChildren = renderJSONTableDocx(fieldContent);
      } else if (
        typeof fieldContent === 'string' &&
        fieldContent.includes('|') &&
        fieldContent.split('\n').some(line => line.trim().startsWith('|'))
      ) {
        const tableResult = renderMarkdownTableDocx(fieldContent);
        if (tableResult) contentChildren = tableResult;
        else
          contentChildren = [
            new Paragraph({
              children: [new TextRun({ text: fieldContent, font: 'Manrope' })],
              font: 'Manrope',
            }),
          ];
      } else {
        if (typeof fieldContent === 'object') {
          try {
            fieldContent = JSON.stringify(fieldContent, null, 2);
          } catch (error) {
            // Ignore JSON stringify errors, use original content
            console.warn('Failed to stringify field content:', error);
          }
        }
        // Parse lists and render paragraphs preserving original markers/indentation
        const structured = parseLinesWithListsDocx(String(fieldContent));
        contentChildren = renderParagraphsDocx(structured);
      }

      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: displayFieldKey, font: 'Manrope' }),
                ],
                font: 'Manrope',
              }),
            ],
            width: { size: nColWidth, type: WidthType.DXA },
            margins: cellMargins,
            verticalAlign: VerticalAlign.TOP,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: fieldName, font: 'Manrope' })],
                font: 'Manrope',
              }),
            ],
            width: { size: fieldColWidth, type: WidthType.DXA },
            margins: cellMargins,
            verticalAlign: VerticalAlign.TOP,
          }),
          new TableCell({
            children: contentChildren,
            width: { size: contentColWidth, type: WidthType.DXA },
            margins: cellMargins,
            verticalAlign: VerticalAlign.TOP,
          }),
        ],
      });
    });
    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: contentWidthTwip, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      margins: { top: 20, bottom: 20 },
    });
  }

  // --- Helpers to parse and render lists for DOCX ---
  function parseLinesWithListsDocx(text) {
    const lines = String(text || '').split(/\r?\n/);
    const items = [];
    const listRegex =
      /^(\s*)([-*+\u2022\u2023\u2043\u204C\u204D\u2219\u25CF\u25D8\u25E6\u2619\u2765\u2767|\d+[.]|[a-zA-Z][.])\s+(.*)$/;
    for (const line of lines) {
      const m = line.match(listRegex);
      if (m) {
        const [, indent, marker, content] = m;
        items.push({
          type: 'list',
          level: Math.floor((indent || '').length / 2),
          marker,
          content,
        });
      } else if (line.trim() === '') {
        items.push({ type: 'blank' });
      } else {
        items.push({ type: 'text', text: line });
      }
    }
    return items;
  }

  function renderParagraphsDocx(items) {
    const paragraphs = [];
    const TWIP_PER_LEVEL = 360; // ~0.25" per level
    for (const it of items) {
      if (it.type === 'text') {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: it.text, font: 'Manrope' })],
            font: 'Manrope',
          })
        );
      } else if (it.type === 'blank') {
        paragraphs.push(new Paragraph({ text: '', font: 'Manrope' }));
      } else if (it.type === 'list') {
        const left = (it.level || 0) * TWIP_PER_LEVEL;
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${it.marker} ${it.content}`,
                font: 'Manrope',
              }),
            ],
            font: 'Manrope',
            indent: { left },
            spacing: { after: 80 },
          })
        );
      }
    }
    return paragraphs.length
      ? paragraphs
      : [new Paragraph({ text: '', font: 'Manrope' })];
  }

  // --- Build DOCX document with sekcje w kolejności PDF (I, compliance, summary, reszta) ---
  // ...nowa logika docSections i currentSectionTitles znajduje się niżej...

  // --- Title page section ---
  // Try to load the logo image for the title page
  let logoImgBuffer = null;
  try {
    logoImgBuffer = await fetchImageBuffer('/audomate-logo.png');
  } catch (e) {
    // ignore if not found
  }

  // Title page content: Vertically and horizontally centered
  // We'll use a large top and bottom margin to center the content block
  // and keep all elements in a single group for perfect centering
  const titlePageChildren = [
    new Paragraph({
      children: [
        new TextRun({
          text: `${tokenName} MiCA Whitepaper Paper`,
          bold: true,
          size: 48,
          font: 'Manrope',
          color: '000000',
        }),
      ],
      alignment: 'center',
      spacing: { before: 4500, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Prepared with assistance from Audomate',
          italics: true,
          size: 28,
          font: 'Manrope',
          color: '333333',
        }),
      ],
      alignment: 'center',
      spacing: { after: 200 },
    }),
    logoImgBuffer
      ? new Paragraph({
          children: [
            new ImageRun({
              data: logoImgBuffer,
              transformation: { width: 200, height: 42.9 }, // Maintain aspect ratio (200 * (71/331) = 42.9)
            }),
          ],
          alignment: 'center',
          spacing: { after: 200 },
        })
      : new Paragraph({ text: '', spacing: { after: 200 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Copyright © 2025 Audomate. All rights reserved.',
          size: 20,
          font: 'Manrope',
          color: '888888',
        }),
      ],
      alignment: 'center',
      spacing: { before: 200 },
    }),
  ];

  // --- Compose the document sections ---
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: pageWidthTwip, height: pageHeightTwip },
            margin: {
              top: marginTwip,
              bottom: marginTwip,
              left: marginTwip,
              right: marginTwip,
            },
          },
        },
        children: titlePageChildren,
      },
      {
        properties: {
          page: {
            size: { width: pageWidthTwip, height: pageHeightTwip },
            margin: {
              top: marginTwip,
              bottom: marginTwip,
              left: marginTwip,
              right: marginTwip,
            },
          },
          footer: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Copyright © 2025 Audomate. All rights reserved.',
                    size: 20,
                    font: 'Manrope',
                    color: '888888',
                  }),
                ],
                alignment: 'center',
                spacing: { before: 200 },
              }),
            ],
          }),
        },
        children: (() => {
          const docChildren = [];
          // Usunięto dodatkowy nagłówek, sekcje zaczynają się od compliance
          docChildren.push(...docSections);
          return docChildren;
        })(),
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const fileName = `${formData.whitepaperType}_Report_${new Date().toISOString().slice(0, 10)}.docx`;
    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return false;
  }
};

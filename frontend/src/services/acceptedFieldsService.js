/**
 * Service to manage field validation status across all parts of the form
 */

// List all fields that need validation by section
const validationFields = {
  partA: [
    'A.01',
    'A.02',
    'A.03',
    'A.04',
    'A.05',
    'A.06',
    'A.07',
    'A.08',
    'A.09',
    'A.10',
    'A.11',
    'A.12',
    'A.13',
    'A.14',
    'A.15',
    'A.16',
    'A.17',
  ],
  partB: [
    'B.01',
    'B.02',
    'B.03',
    'B.04',
    'B.05',
    'B.06',
    'B.07',
    'B.08',
    'B.09',
    'B.10',
    'B.11',
    'B.12',
  ],
  partC: [
    'C.01',
    'C.02',
    'C.03',
    'C.04',
    'C.05',
    'C.06',
    'C.07',
    'C.08',
    'C.09',
    'C.10',
    'C.11',
    'C.12',
    'C.13',
    'C.14',
  ],
  partD: [
    'D.1',
    'D.2',
    'D.3',
    'D.4',
    'D.5',
    'D.6',
    'D.7',
    'D.8',
    'D.9',
    'D.10',
  ],
  partE: Array.from({ length: 40 }, (_, i) => `E.${i + 1}`),
  partF: Array.from({ length: 20 }, (_, i) => `F.${i + 1}`),
  partG: ['G.01', 'G.02', 'G.03', 'G.04', 'G.05', 'G.06', 'G.07', 'G.08'],
  partH: ['H.1', 'H.2', 'H.3', 'H.4', 'H.5', 'H.6', 'H.7', 'H.8', 'H.9'],
  partJ: [
    'J.1',
    'S.1',
    'S.2',
    'S.3',
    'S.4',
    'S.5',
    'S.6',
    'S.7',
    'S.8',
    'S.9',
    'S.10',
    'S.11',
    'S.12',
    'S.13',
    'S.14',
    'S.15',
    'S.16',
    'S.17',
    'S.18',
    'S.19',
    'S.21',
    'S.22',
    'S.23',
    'S.24',
    'S.25',
    'S.26',
    'S.27',
    'S.28',
    'S.29',
    'S.31',
    'S.32',
    'S.33',
    'S.34',
    'S.35',
    'S.36',
  ],
};

export const debugScrapedFields = scrapedData => {
  const prefixes = new Set();
  Object.keys(scrapedData).forEach(key => {
    if (key.includes('.')) {
      prefixes.add(key.split('.')[0]);
    }
  });
  return Array.from(prefixes);
};

export const getUnresolvedFieldsSummary = (
  scrapedData,
  acceptedFields,
  improvedFields
) => {
  if (!scrapedData || Object.keys(scrapedData).length === 0) {
    return {};
  }

  console.log(
    'Checking for unresolved fields in:',
    Object.keys(scrapedData).length,
    'fields'
  );
  console.log('Accepted fields:', acceptedFields);
  console.log('Improved fields:', improvedFields);

  const unresolvedFields = {};
  const excludedFields = ['S.20', 'S.30']; // Fields to exclude from validation

  Object.keys(scrapedData).forEach(key => {
    if (!key.includes('.')) return;

    if (excludedFields.includes(key)) return;

    const [section, fieldNumber] = key.split('.');
    const sectionName = `part${section}`;

    const field = scrapedData[key];
    if (
      field &&
      field.unanswered_questions &&
      field.unanswered_questions.length > 0
    ) {
      const normalizedKey = key;
      const alternateKey =
        section +
        '.' +
        (fieldNumber.startsWith('0')
          ? fieldNumber.substring(1)
          : '0' + fieldNumber);

      const isResolved =
        acceptedFields.includes(normalizedKey) ||
        acceptedFields.includes(alternateKey) ||
        improvedFields.includes(normalizedKey) ||
        improvedFields.includes(alternateKey);

      if (!isResolved) {
        if (!unresolvedFields[sectionName]) {
          unresolvedFields[sectionName] = [];
        }
        unresolvedFields[sectionName].push(normalizedKey);
        console.log(
          `Found unresolved field: ${normalizedKey} - Questions:`,
          field.unanswered_questions
        );
      }
    }
  });

  return unresolvedFields;
};

export const checkAllFieldsResolved = (
  scrapedData,
  acceptedFields,
  improvedFields
) => {
  const unresolvedFields = getUnresolvedFieldsSummary(
    scrapedData,
    acceptedFields,
    improvedFields
  );
  const allResolved = Object.keys(unresolvedFields).length === 0;

  console.log(
    'Final validation result:',
    allResolved ? 'All resolved' : 'Unresolved fields remain'
  );

  return {
    allResolved,
    unresolvedFields,
  };
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EditableTable = ({
  fieldId,
  initialData = '',
  onChange,
  columns = [],
  className = '',
  disabled = false,
  showError = false,
  errorMessage = 'Answer follow-up questions in order to generate a fill-out',
  backgroundColor = 'bg-white',
  // New props for handling field data states
  fieldDataItem = null,
  renderActionButtons = null,
  renderInlineFollowUpQuestions = null,
  getHighlightClass = () => '',
  // Add props to detect accepted/improved status
  acceptedFields = [],
  improvedFields = [],
  percentageDecimals = 2,
}) => {
  const [rows, setRows] = useState([]);
  const textAreaRefs = useRef({});

  // Determine table state based on field data - memoized to prevent unnecessary re-renders
  const getTableState = useCallback(() => {
    console.log('EditableTable getTableState - fieldDataItem:', fieldDataItem);
    console.log('EditableTable getTableState - initialData:', initialData);
    console.log(
      'EditableTable getTableState - fieldDataItem structure:',
      JSON.stringify(fieldDataItem, null, 2)
    );

    if (!fieldDataItem) {
      console.log('No fieldDataItem, using fallback state');
      return {
        showError: false,
        backgroundColor: '',
        errorMessage:
          'Answer follow-up questions in order to generate a fill-out',
        showFollowUp: false,
        showActionButtons: false,
      };
    }

    // Check if field is accepted or improved - this should override other states
    const normalizedFieldId = fieldId;
    const alternateFieldId = fieldId.includes('.0')
      ? fieldId.replace(/\.0(\d)/, '.$1')
      : fieldId.replace(/\.(\d)$/, '.0$1');

    const isAccepted =
      acceptedFields.includes(normalizedFieldId) ||
      acceptedFields.includes(alternateFieldId);
    const isImproved =
      improvedFields.includes(normalizedFieldId) ||
      improvedFields.includes(alternateFieldId);

    // If accepted or improved, show normal white table
    if (isAccepted || isImproved) {
      console.log('Field is accepted/improved - showing white table');
      return {
        showError: false,
        backgroundColor: '',
        showFollowUp: false,
        showActionButtons: false,
      };
    }

    const hasUnansweredQuestions =
      fieldDataItem?.unanswered_questions &&
      fieldDataItem.unanswered_questions.length > 0;
    const totallyUnanswered = fieldDataItem?.totally_unanswered;

    console.log(
      'EditableTable - hasUnansweredQuestions:',
      hasUnansweredQuestions
    );
    console.log('EditableTable - totallyUnanswered:', totallyUnanswered);
    console.log(
      'EditableTable - totallyUnanswered type:',
      typeof totallyUnanswered
    );
    console.log(
      'EditableTable - unanswered_questions:',
      fieldDataItem?.unanswered_questions
    );

    // Check if field_text is valid JSON
    let isValidJson = false;
    try {
      if (initialData && initialData.trim()) {
        const parsed = JSON.parse(initialData);
        isValidJson = Array.isArray(parsed) || typeof parsed === 'object';
        console.log('EditableTable - parsed JSON:', parsed);
      }
    } catch (e) {
      console.log('EditableTable - JSON parse error:', e);
      isValidJson = false;
    }

    console.log('EditableTable getTableState decision factors:', {
      fieldId,
      hasUnansweredQuestions,
      totallyUnanswered,
      'totallyUnanswered === true': totallyUnanswered === true,
      'totallyUnanswered == true': totallyUnanswered == true,
      'totallyUnanswered === false': totallyUnanswered === false,
      isValidJson,
      initialDataLength: initialData?.length,
    });

    // Reorder and fix the conditions to ensure proper matching
    if (
      isValidJson &&
      hasUnansweredQuestions &&
      (totallyUnanswered === true || totallyUnanswered === 'true')
    ) {
      console.log(
        'Case 4: JSON with unanswered questions and totally unanswered - RED TABLE WITH DATA'
      );
      return {
        showError: false,
        backgroundColor: 'bg-red-200',
        showFollowUp: true,
        showActionButtons: true,
      };
    } else if (
      !isValidJson &&
      hasUnansweredQuestions &&
      (totallyUnanswered === true || totallyUnanswered === 'true')
    ) {
      console.log(
        'Case 4b: No JSON, unanswered questions and totally unanswered - RED TABLE WITH BLANK DATA'
      );
      return {
        showError: false, // Changed from true to false - show blank editable table
        backgroundColor: 'bg-red-200',
        showFollowUp: true,
        showActionButtons: true,
      };
    } else if (
      isValidJson &&
      hasUnansweredQuestions &&
      (totallyUnanswered === false || totallyUnanswered === 'false')
    ) {
      console.log(
        'Case 2: JSON with unanswered questions - YELLOW TABLE WITH DATA'
      );
      return {
        showError: false,
        backgroundColor: 'bg-yellow-200',
        showFollowUp: true,
        showActionButtons: true,
      };
    } else if (
      !isValidJson &&
      hasUnansweredQuestions &&
      (totallyUnanswered === false || totallyUnanswered === 'false')
    ) {
      console.log(
        'Case 3: No JSON, unanswered questions - YELLOW TABLE WITH BLANK DATA'
      );
      return {
        showError: false, // Changed from true to false - show blank editable table
        backgroundColor: 'bg-yellow-200',
        showFollowUp: true,
        showActionButtons: true,
      };
    } else if (isValidJson && !hasUnansweredQuestions) {
      console.log('Case 1: JSON, no unanswered questions');
      return {
        showError: false,
        backgroundColor: '',
        showFollowUp: false,
        showActionButtons: false,
      };
    } else {
      console.log('Default case: show white table with blank data');
      return {
        showError: false, // Changed from true to false - show blank editable table
        backgroundColor: '',
        showFollowUp: false,
        showActionButtons: false,
      };
    }
  }, [fieldDataItem, fieldId, acceptedFields, improvedFields, initialData]);

  // Get the current table state - memoized to prevent unnecessary re-renders
  const tableState = useMemo(() => {
    if (fieldDataItem) {
      return getTableState();
    } else {
      return {
        showError: showError,
        backgroundColor: backgroundColor,
        errorMessage: errorMessage,
        showFollowUp: false,
        showActionButtons: false,
      };
    }
  }, [fieldDataItem, getTableState, showError, backgroundColor, errorMessage]);

  console.log('EditableTable final tableState:', tableState);

  const getEmptyRow = useCallback(() => {
    const empty = {};
    columns.forEach(col => {
      const key =
        col.key === 'identity'
          ? 'Identity'
          : col.key === 'businessAddress'
            ? 'Business Address'
            : col.key === 'functions'
              ? 'Functions'
              : col.key === 'expenseType'
                ? 'Type of Expense'
                : col.key === 'description'
                  ? 'Description'
                  : col.key === 'amount'
                    ? 'Amount'
                    : col.key;
      empty[key] = '';
    });
    return empty;
  }, [columns]);

  const parseTableData = useCallback(
    data => {
      if (typeof data !== 'string' || data.trim() === '') {
        setRows([getEmptyRow()]);
        return;
      }

      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setRows(parsed.length > 0 ? parsed : [getEmptyRow()]);
          return;
        }
      } catch (e) {
        setRows([getEmptyRow()]);
      }
    },
    [getEmptyRow]
  );

  useEffect(() => {
    // Always parse table data, never show error message
    parseTableData(initialData);
  }, [initialData, parseTableData]);

  useEffect(() => {
    Object.values(textAreaRefs.current).forEach(textarea => {
      if (!textarea) return;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [rows]);

  const generateTableData = useCallback(updatedRows => {
    // Return JSON format to match dummy data
    return JSON.stringify(updatedRows, null, 4);
  }, []);

  const roundTo = useCallback((value, decimals) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }, []);

  const handleCellChange = useCallback(
    (rowIdx, colKey, val) => {
      setRows(prevRows => {
        const copy = [...prevRows];
        let nextVal = val;

        // Normalize "Percentage" columns: strip % and commas, coerce to number with configured precision
        if (colKey === 'Percentage') {
          const parsed = parseFloat(
            String(val).replace(/%/g, '').replace(/,/g, '.').trim()
          );
          nextVal = Number.isNaN(parsed)
            ? ''
            : roundTo(parsed, percentageDecimals);
        }

        copy[rowIdx][colKey] = nextVal;
        onChange(fieldId, generateTableData(copy));
        return copy;
      });
    },
    [fieldId, onChange, generateTableData, percentageDecimals, roundTo]
  );

  const addRow = useCallback(() => {
    setRows(prevRows => {
      const copy = [...prevRows, getEmptyRow()];
      onChange(fieldId, generateTableData(copy));
      return copy;
    });
  }, [fieldId, onChange, getEmptyRow, generateTableData]);

  const removeRow = useCallback(
    rowIdx => {
      setRows(prevRows => {
        if (prevRows.length <= 1) return prevRows;
        const copy = prevRows.filter((_, i) => i !== rowIdx);
        onChange(fieldId, generateTableData(copy));
        return copy;
      });
    },
    [fieldId, onChange, generateTableData]
  );

  const getDisplayKey = useCallback(colKey => {
    return colKey === 'identity'
      ? 'Identity'
      : colKey === 'businessAddress'
        ? 'Business Address'
        : colKey === 'functions'
          ? 'Functions'
          : colKey === 'expenseType'
            ? 'Type of Expense'
            : colKey === 'description'
              ? 'Description'
              : colKey === 'amount'
                ? 'Amount'
                : colKey;
  }, []);
  const TableComponent = useMemo(() => {
    // Removed the error state rendering - always show the editable table
    return (
      <div className='editable-table'>
        <div className='overflow-x-auto'>
          <table
            className={`w-full border-collapse ${tableState.backgroundColor}`}
            style={{ border: 'none' }}
          >
            <thead>
              <tr className='bg-gray-100'>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className='border border-gray-300 px-4 py-2 text-left font-semibold'
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className='group hover:bg-gray-50'>
                  {columns.map((col, colIdx) => {
                    const displayKey = getDisplayKey(col.key);
                    return (
                      <td
                        key={col.key}
                        className='relative border border-gray-300 px-2 py-1'
                      >
                        <textarea
                          ref={el =>
                            (textAreaRefs.current[`${rowIdx}-${col.key}`] = el)
                          }
                          value={
                            displayKey === 'Percentage'
                              ? (() => {
                                  const raw = row[displayKey];
                                  if (
                                    raw === '' ||
                                    raw === undefined ||
                                    raw === null
                                  )
                                    return '';
                                  const num =
                                    typeof raw === 'number'
                                      ? raw
                                      : parseFloat(
                                          String(raw)
                                            .replace(/%/g, '')
                                            .replace(/,/g, '.')
                                        );
                                  return Number.isNaN(num)
                                    ? String(raw)
                                    : `${num.toFixed(percentageDecimals)}%`;
                                })()
                              : row[displayKey] || ''
                          }
                          onChange={e =>
                            handleCellChange(rowIdx, displayKey, e.target.value)
                          }
                          rows={1}
                          disabled={disabled}
                          className={`w-full p-2 border-none resize-none overflow-hidden ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`}
                          onInput={e => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                        />

                        {!disabled && colIdx === columns.length - 1 && (
                          <button
                            type='button'
                            onClick={() => removeRow(rowIdx)}
                            disabled={rows.length <= 1}
                            title='Delete Row'
                            className={`
                              absolute bottom-1 right-1 w-4 h-4 text-xs leading-none
                              border-none bg-red-50 hover:bg-red-100 p-0 m-0 font-normal
                              flex items-center justify-center
                              transition-all duration-200 ease-in-out
                              ${
                                rows.length <= 1
                                  ? 'opacity-0 cursor-not-allowed'
                                  : 'opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:shadow-sm'
                              }
                            `}
                            style={{
                              fontFamily: 'inherit',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              lineHeight: '1',
                              padding: '0',
                              margin: '0',
                              border: 'none',
                              borderRadius: '2px',
                              width: '16px',
                              height: '16px',
                              minWidth: '16px',
                              minHeight: '16px',
                              background:
                                rows.length <= 1 ? 'transparent' : '#fef2f2',
                              boxShadow: 'none',
                            }}
                            onMouseEnter={e => {
                              if (rows.length > 1) {
                                e.target.style.background = '#fee2e2';
                                e.target.style.transform = 'scale(1.1)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (rows.length > 1) {
                                e.target.style.background = '#fef2f2';
                                e.target.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!disabled && (
          <div
            className='mt-3 bg-white p-0 border-0'
            style={{ backgroundColor: 'white', border: 'none' }}
          >
            <button
              type='button'
              onClick={addRow}
              className='add-row-btn px-3 py-1 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              style={{
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: 'normal',
                lineHeight: '1.4',
                padding: '6px 12px',
                border: '2px solid #004494',
                borderRadius: '7px',
                backgroundColor: '#004494',
                color: 'white',
              }}
            >
              + Add Row
            </button>
          </div>
        )}
      </div>
    );
  }, [
    className,
    tableState.backgroundColor,
    columns,
    rows,
    disabled,
    handleCellChange,
    getDisplayKey,
    removeRow,
    addRow,
    percentageDecimals,
  ]);

  return (
    <div style={{ backgroundColor: 'white', border: 'none' }}>
      {TableComponent}
      {tableState.showActionButtons && renderActionButtons && (
        <div
          className='self-start mt-1'
          style={{ backgroundColor: 'white', border: 'none' }}
        >
          {renderActionButtons(fieldId)}
        </div>
      )}
      {tableState.showFollowUp &&
        renderInlineFollowUpQuestions &&
        renderInlineFollowUpQuestions(fieldId)}
    </div>
  );
};

export default EditableTable;

// Table parsing utilities for handling various markdown table formats

export interface ParsedTable {
  headers: string[];
  rows: string[][];
  maxColumns: number;
}

export const parseMarkdownTable = (content: string): ParsedTable | null => {
  const lines = content.split('\n').filter(line => line.trim());
  const tableLines = lines.filter(line => line.includes('|'));
  
  if (tableLines.length === 0) {
    return null;
  }

  // Remove separator lines (lines with only |, -, :, and whitespace)
  const dataLines = tableLines.filter(line => 
    !line.match(/^\s*\|?[-\s|:]+\|?\s*$/)
  );

  if (dataLines.length === 0) {
    return null;
  }

  const parsedRows: string[][] = [];
  let maxColumns = 0;

  dataLines.forEach((line, index) => {
    const cells = parseTableRow(line);
    if (cells.length > 0) {
      maxColumns = Math.max(maxColumns, cells.length);
      parsedRows.push(cells);
    }
  });

  if (parsedRows.length === 0) {
    return null;
  }

  // Normalize all rows to have the same number of columns
  const normalizedRows = parsedRows.map(row => {
    const normalizedRow = [...row];
    while (normalizedRow.length < maxColumns) {
      normalizedRow.push('');
    }
    return normalizedRow.slice(0, maxColumns);
  });

  const headers = normalizedRows[0] || [];
  const rows = normalizedRows.slice(1);

  return {
    headers,
    rows,
    maxColumns
  };
};

const parseTableRow = (line: string): string[] => {
  if (!line.includes('|')) {
    return [];
  }

  // Split by | and clean up
  const cells = line.split('|');
  
  // Handle different table formats:
  // Format 1: | cell1 | cell2 | cell3 |
  // Format 2: cell1 | cell2 | cell3
  // Format 3: | cell1 | cell2 | cell3
  
  let cleanCells: string[] = [];
  
  if (cells.length >= 3) {
    // Check if it's format 1 (starts and ends with |)
    if (cells[0].trim() === '' && cells[cells.length - 1].trim() === '') {
      cleanCells = cells.slice(1, -1);
    } else if (cells[0].trim() === '') {
      // Format 3 (starts with |)
      cleanCells = cells.slice(1);
    } else {
      // Format 2 (no surrounding |)
      cleanCells = cells;
    }
  } else {
    // Handle edge case with fewer cells
    cleanCells = cells.filter(cell => cell.trim() !== '');
  }

  return cleanCells.map(cell => cell.trim());
};

export const debugTable = (content: string): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const lines = content.split('\n');
  const tableLines = lines.filter(line => line.includes('|'));
  
  console.group('Table Debug');
  console.log('Total lines:', lines.length);
  console.log('Lines with |:', tableLines.length);
  
  tableLines.forEach((line, index) => {
    const cells = parseTableRow(line);
    console.log(`Row ${index + 1}: ${cells.length} cells`, cells);
  });
  
  const parsed = parseMarkdownTable(content);
  if (parsed) {
    console.log('Parsed table:', parsed);
  } else {
    console.log('Failed to parse table');
  }
  
  console.groupEnd();
};
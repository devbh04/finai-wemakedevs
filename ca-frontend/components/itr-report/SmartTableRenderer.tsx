"use client";
import React from 'react';
import { parseMarkdownTable, debugTable } from './tableUtils';
import EnhancedReportTable from './EnhancedReportTable';
import ReportTable from './ReportTable';

interface SmartTableRendererProps {
  content: string;
  theme: any;
  sectionType?: string;
  fallbackToSimple?: boolean;
}

const SmartTableRenderer: React.FC<SmartTableRendererProps> = ({
  content,
  theme,
  sectionType,
  fallbackToSimple = true
}) => {
  // Debug the content in development
  if (process.env.NODE_ENV === 'development') {
    debugTable(content);
  }

  // Try to parse as a markdown table
  const parsedTable = parseMarkdownTable(content);
  
  if (parsedTable && parsedTable.maxColumns >= 2) {
    return (
      <EnhancedReportTable
        headers={parsedTable.headers}
        rows={parsedTable.rows}
        theme={theme}
        sectionType={sectionType}
      />
    );
  }

  // Fallback: try to detect any tabular data
  if (fallbackToSimple) {
    const lines = content.split('\n').filter(line => line.trim());
    const potentialTableLines = lines.filter(line => 
      line.includes('|') || 
      line.includes('\t') ||
      (line.includes(':') && line.split(/\s{2,}/).length > 1) // Detect space-separated columns
    );

    if (potentialTableLines.length >= 2) {
      // Try to create a simple table structure
      const fallbackRows: string[][] = [];
      
      potentialTableLines.forEach(line => {
        let cells: string[] = [];
        
        if (line.includes('|')) {
          cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        } else if (line.includes('\t')) {
          cells = line.split('\t').map(cell => cell.trim()).filter(cell => cell !== '');
        } else if (line.includes(':')) {
          // Try to parse colon-separated data like "Item: Value"
          const parts = line.split(':');
          if (parts.length === 2) {
            cells = [parts[0].trim(), parts[1].trim()];
          }
        } else {
          // Try to split by multiple spaces
          cells = line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell !== '');
        }
        
        if (cells.length >= 2) {
          fallbackRows.push(cells);
        }
      });

      if (fallbackRows.length >= 1) {
        // Find the maximum number of columns
        const maxCols = Math.max(...fallbackRows.map(row => row.length));
        
        // Normalize all rows
        const normalizedRows = fallbackRows.map(row => {
          const normalized = [...row];
          while (normalized.length < maxCols) {
            normalized.push('');
          }
          return normalized.slice(0, maxCols);
        });

        if (normalizedRows.length >= 1) {
          const headers = normalizedRows[0];
          const rows = normalizedRows.slice(1);
          
          return (
            <EnhancedReportTable
              headers={headers}
              rows={rows}
              theme={theme}
              sectionType={`${sectionType} (fallback)`}
            />
          );
        }
      }
    }
  }

  // If no table could be parsed, return null
  return null;
};

export default SmartTableRenderer;
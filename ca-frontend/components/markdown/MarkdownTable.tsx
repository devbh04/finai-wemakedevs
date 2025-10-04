"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface MarkdownTableProps {
  content: string;
  className?: string;
}

export default function MarkdownTable({ content, className = "" }: MarkdownTableProps) {
  // Parse markdown table manually as a fallback
  const parseMarkdownTable = (text: string): TableData | null => {
    const lines = text.trim().split('\n');
    if (lines.length < 3) return null; // Need at least header, separator, and one row
    
    // Extract headers
    const headerLine = lines[0];
    if (!headerLine.includes('|')) return null;
    
    const headers = headerLine
      .split('|')
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    // Skip separator line (line 1 with |---|---|)
    const separatorLine = lines[1];
    if (!separatorLine.includes('---')) return null;
    
    // Extract rows
    const rows = lines.slice(2)
      .filter(line => line.includes('|'))
      .map(line => 
        line
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0)
      )
      .filter(row => row.length > 0);
    
    return { headers, rows };
  };

  const tableData = parseMarkdownTable(content);
  
  if (!tableData) {
    return null; // Return null if not a valid table
  }

  const { headers, rows } = tableData;

  const getCellStyle = (cellContent: string) => {
    let baseStyle = "px-6 py-4 text-sm text-gray-900";
    
    if (cellContent.includes('₹')) {
      return `${baseStyle} font-semibold text-green-700 text-right`;
    } else if (cellContent.includes('%')) {
      return `${baseStyle} font-medium text-blue-600 text-right`;
    } else if (cellContent.match(/^\d+$/)) {
      return `${baseStyle} text-right font-mono`;
    } else if (cellContent.length > 50) {
      return `${baseStyle} whitespace-normal max-w-xs`;
    } else {
      return `${baseStyle} whitespace-nowrap`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`overflow-hidden rounded-xl border border-gray-200 shadow-lg mb-8 bg-white ${className}`}
    >
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-full table-auto">
          <thead className="bg-gradient-to-r from-amber-500 to-orange-500">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                className="hover:bg-amber-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={getCellStyle(cell)}
                  >
                    {cell}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
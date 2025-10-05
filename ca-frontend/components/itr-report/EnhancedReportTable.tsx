"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";

interface EnhancedReportTableProps {
  headers: string[];
  rows: string[][];
  theme: any;
  sectionType?: string;
  className?: string;
}

const EnhancedReportTable: React.FC<EnhancedReportTableProps> = ({
  headers,
  rows,
  theme,
  sectionType,
  className = ""
}) => {
  const formatCellContent = (content: string, isHeader = false) => {
    if (!content || content.trim() === '') {
      return isHeader ? '' : '-';
    }

    const cleanContent = content.trim();
    
    // Enhanced formatting patterns
    const patterns = {
      currency: /^[₹$€£¥][\d,.]+(\.?\d{0,2})?$|^\d+[\d,]*\.?\d{0,2}\s*[₹$€£¥]?$/,
      percentage: /^\d+\.?\d*%$|^%\d+\.?\d*$/,
      number: /^\d+[\d,]*\.?\d*$/,
      date: /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$|^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
      year: /^\d{4}(-\d{2})?$/,
      negative: /^\(-?\d+[\d,]*\.?\d*\)$|^-\d+[\d,]*\.?\d*$/
    };

    // Apply formatting based on content type
    if (patterns.currency.test(cleanContent)) {
      return (
        <span className="font-mono text-right font-semibold text-emerald-700 dark:text-emerald-300">
          {cleanContent}
        </span>
      );
    }
    
    if (patterns.percentage.test(cleanContent)) {
      return (
        <span className="font-mono text-right font-medium text-blue-600 dark:text-blue-400">
          {cleanContent}
        </span>
      );
    }
    
    if (patterns.number.test(cleanContent) && !isHeader) {
      return (
        <span className="font-mono text-right text-gray-700 dark:text-gray-300">
          {cleanContent}
        </span>
      );
    }
    
    if (patterns.date.test(cleanContent)) {
      return (
        <span className="font-medium text-purple-600 dark:text-purple-400">
          {cleanContent}
        </span>
      );
    }
    
    if (patterns.negative.test(cleanContent)) {
      return (
        <span className="font-mono text-right font-semibold text-red-600 dark:text-red-400">
          {cleanContent}
        </span>
      );
    }

    return cleanContent;
  };

  const getColumnAlignment = (header: string, columnIndex: number) => {
    const headerLower = header.toLowerCase();
    
    // Right align for numeric columns
    if (headerLower.includes('amount') || 
        headerLower.includes('value') || 
        headerLower.includes('total') || 
        headerLower.includes('tax') ||
        headerLower.includes('income') ||
        headerLower.includes('deduction') ||
        headerLower.includes('₹') ||
        headerLower.includes('$') ||
        headerLower.includes('%')) {
      return 'text-right';
    }
    
    // Center align for short status columns
    if (headerLower.includes('status') || 
        headerLower.includes('type') ||
        header.length <= 4) {
      return 'text-center';
    }
    
    return 'text-left';
  };

  if (!headers || headers.length === 0) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${theme.header}`}>
            <tr className={`${theme.header} text-white`}>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-sm font-semibold ${getColumnAlignment(header, index)}`}
                >
                  {formatCellContent(header, true)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className={`
                  ${rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900/50'}
                  hover:${theme.secondary} hover:shadow-sm transition-all duration-200
                  border-b border-gray-200 dark:border-gray-700
                `}
              >
                {headers.map((header, cellIndex) => {
                  const cellContent = row[cellIndex] || '';
                  return (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 text-sm ${getColumnAlignment(header, cellIndex)}`}
                    >
                      {formatCellContent(cellContent)}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table metadata for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
          Columns: {headers.length} | Rows: {rows.length} | Section: {sectionType || 'unknown'}
        </div>
      )}
    </Card>
  );
};

export default EnhancedReportTable;
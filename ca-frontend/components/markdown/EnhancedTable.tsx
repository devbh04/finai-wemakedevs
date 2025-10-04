"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedTableProps {
  headers: string[];
  rows: string[][];
  title?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export default function EnhancedTable({ 
  headers, 
  rows, 
  title, 
  className = "",
  striped = true,
  hoverable = true 
}: EnhancedTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
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
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                  ${hoverable ? 'hover:bg-amber-50 transition-colors duration-200' : ''}
                `}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {/* Check if cell contains currency */}
                    {cell.includes('₹') ? (
                      <span className="font-semibold text-green-700">{cell}</span>
                    ) : cell.includes('%') ? (
                      <span className="font-medium text-blue-600">{cell}</span>
                    ) : (
                      cell
                    )}
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
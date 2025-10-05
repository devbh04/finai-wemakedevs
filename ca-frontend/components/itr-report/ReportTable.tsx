import React from 'react';

interface ReportTableProps {
  data: string[][];
  theme: {
    header: string;
    secondary: string;
    icon: string;
  };
}

const ReportTable: React.FC<ReportTableProps> = ({ data, theme }) => {
  if (data.length < 1) return null;

  const headers = data[0];
  const rows = data.slice(1).filter(row => row && row.length > 0);
  
  if (headers.length === 0) return null;
  
  // Ensure all rows have the same number of columns as headers
  const normalizedRows = rows.map(row => {
    const normalizedRow = [...row];
    while (normalizedRow.length < headers.length) {
      normalizedRow.push(''); // Fill missing columns
    }
    return normalizedRow.slice(0, headers.length); // Trim extra columns
  });

  const formatCellContent = (content: string) => {
    if (!content || content.trim() === '') return content;
    
    const trimmedContent = content.trim();
    
    // Format currency with various patterns
    if (trimmedContent.match(/₹[\d,]+(\.\d{2})?/) || trimmedContent.match(/\$[\d,]+(\.\d{2})?/)) {
      return <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap">{trimmedContent}</span>;
    }
    
    // Format percentages
    if (trimmedContent.match(/[\d.]+\s*%/) || trimmedContent.match(/\d+\.\d+%/)) {
      return <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{trimmedContent}</span>;
    }
    
    // Format dates (various formats)
    if (trimmedContent.match(/\d{1,2}[-/]\d{1,2}[-/]\d{4}/) || 
        trimmedContent.match(/\d{4}-\d{2}-\d{2}/) || 
        trimmedContent.match(/\w{3}-\d{2}/) ||
        trimmedContent.match(/Month?\s*\d+/i)) {
      return <span className="font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">{trimmedContent}</span>;
    }
    
    // Format numbers (large numbers, amounts without currency)
    if (trimmedContent.match(/^\d{1,3}(,\d{3})*(\.\d{2})?$/) && parseInt(trimmedContent.replace(/,/g, '')) > 1000) {
      return <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{trimmedContent}</span>;
    }
    
    // Format status indicators
    if (trimmedContent.toLowerCase().includes('yes') || trimmedContent.toLowerCase().includes('completed') || trimmedContent.includes('✅')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{trimmedContent}</span>;
    }
    if (trimmedContent.toLowerCase().includes('no') || trimmedContent.toLowerCase().includes('pending') || trimmedContent.includes('❌')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{trimmedContent}</span>;
    }
    
    // Format CAGR, returns, rates
    if (trimmedContent.match(/\d+(\.\d+)?\s*(cagr|return|rate)/i)) {
      return <span className="font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">{trimmedContent}</span>;
    }
    
    // Format years, durations
    if (trimmedContent.match(/\d+\s*(year|yr|month|mo)s?/i)) {
      return <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded text-sm">{trimmedContent}</span>;
    }
    
    return trimmedContent;
  };

  return (
    <div className="overflow-x-auto my-6 shadow-lg rounded-lg bg-transparent">
      <table className="w-full border-collapse rounded-lg overflow-hidden bg-transparent">
        <thead className={`${theme.header}`}>
          <tr className={`${theme.header} text-white`}>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-transparent">
          {normalizedRows.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`${rowIndex % 2 === 0 ? 'bg-white' : `bg-gradient-to-r ${theme.secondary}`} hover:bg-gray-50 transition-colors duration-200`}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 text-sm text-gray-700 align-top">
                  {formatCellContent(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
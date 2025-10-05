"use client";
import React from 'react';
import SmartTableRenderer from './SmartTableRenderer';

interface TableTestProps {
  theme: any;
}

const TableTest: React.FC<TableTestProps> = ({ theme }) => {
  const testTables = [
    {
      name: "Standard Markdown Table",
      content: `| Item | Amount | Tax |
|------|--------|-----|
| Salary | ₹500,000 | ₹50,000 |
| Bonus | ₹100,000 | ₹10,000 |`
    },
    {
      name: "Table without borders",
      content: `Item | Amount | Tax
Salary | ₹500,000 | ₹50,000
Bonus | ₹100,000 | ₹10,000`
    },
    {
      name: "Table with inconsistent columns",
      content: `| Description | Amount |
|-------------|--------|
| Basic Salary | ₹400,000 |
| HRA | ₹120,000 | 10% |
| Medical | ₹15,000 |`
    },
    {
      name: "Colon-separated data",
      content: `Basic Salary: ₹400,000
HRA: ₹120,000
Medical Allowance: ₹15,000
Transport: ₹9,000`
    },
    {
      name: "Space-separated data",
      content: `Item                Amount       Tax
Basic Salary        ₹400,000     ₹40,000
House Rent Allow    ₹120,000     ₹12,000
Medical Allow       ₹15,000      ₹1,500`
    }
  ];

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Table Parsing Test Results
      </h3>
      
      {testTables.map((test, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
            {test.name}
          </h4>
          
          <div className="mb-3">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                Show raw content
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                {test.content}
              </pre>
            </details>
          </div>
          
          <SmartTableRenderer
            content={test.content}
            theme={theme}
            sectionType={`Test: ${test.name}`}
            fallbackToSimple={true}
          />
        </div>
      ))}
    </div>
  );
};

export default TableTest;
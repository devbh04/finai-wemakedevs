"use client";

import React from 'react';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

const testMarkdown = `
# Test Report

This is a test to verify table rendering.

## Financial Summary

| Category | Amount (₹) | Percentage |
|----------|------------|------------|
| Revenue | 2,000,000 | 100% |
| Expenses | 1,500,000 | 75% |
| Profit | 500,000 | 25% |
| Tax | 100,000 | 5% |

## Compliance Status

| Item | Status | Due Date |
|------|--------|----------|
| GST Filing | Completed | 20-Jan-2024 |
| ITR Filing | Pending | 31-Jul-2024 |
| TDS Returns | Partial | 31-Mar-2024 |

## Complex Table Example

| Document | Extraction Status | Key Data Points Extracted |
|----------|-------------------|---------------------------|
| Salary Slip | Complete | Basic ₹600,000; HRA ₹240,000; Conveyance ₹19,200 |
| Form 16 | Complete | Total Salary ₹1,074,200; TDS ₹78,400; Standard Deduction ₹50,000 |
| Bank Statements | Not Available | – |

This should render properly now with the remark-gfm plugin.
`;

export default function TableTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Table Rendering Test</h1>
      <MarkdownRenderer content={testMarkdown} />
    </div>
  );
}
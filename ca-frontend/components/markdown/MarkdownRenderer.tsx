"use client";

import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Calendar, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Clock,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import MarkdownTable from './MarkdownTable';

interface MarkdownRendererProps {
  content: string;
  reportType?: 'salaried' | 'business' | 'self-employed';
  className?: string;
}

// Custom components for different markdown elements
const components = {
  // Headers
  h1: ({ children, ...props }: any) => (
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
      {...props}
    >
      {children}
    </motion.h1>
  ),
  
  h2: ({ children, ...props }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 mt-12 first:mt-0"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800" {...props}>
          {children}
        </h2>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-amber-200 via-orange-200 to-transparent"></div>
    </motion.div>
  ),
  
  h3: ({ children, ...props }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4 mt-8"
    >
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
          <BarChart3 className="w-3 h-3 text-amber-600" />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800" {...props}>
          {children}
        </h3>
      </div>
    </motion.div>
  ),
  
  h4: ({ children, ...props }: any) => (
    <h4 className="text-lg font-semibold text-gray-700 mb-3 mt-6 flex items-center space-x-2" {...props}>
      <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
      <span>{children}</span>
    </h4>
  ),
  
  // Paragraphs
  p: ({ children, ...props }: any) => {
    // Check if it's a bold paragraph (starts with **)
    if (typeof children === 'string' && children.includes('**')) {
      return (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg">
          <p className="text-gray-800 font-medium leading-relaxed" {...props}>
            {children}
          </p>
        </div>
      );
    }
    
    return (
      <p className="text-gray-700 leading-relaxed mb-4 text-justify" {...props}>
        {children}
      </p>
    );
  },
  
  // Tables
  table: ({ children, ...props }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-xl border border-gray-200 shadow-lg mb-8 bg-white"
    >
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-full table-auto markdown-table" {...props}>
          {children}
        </table>
      </div>
    </motion.div>
  ),
  
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gradient-to-r from-amber-500 to-orange-500 text-white" {...props}>
      {children}
    </thead>
  ),
  
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-gray-200" {...props}>
      {children}
    </tbody>
  ),
  
  th: ({ children, ...props }: any) => (
    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: any) => {
    // Enhanced cell rendering with better formatting for financial data
    const content = typeof children === 'string' ? children : children?.toString?.() || '';
    
    let cellClass = "px-6 py-4 text-sm text-gray-900";
    
    // Add special styling for different types of content
    if (content.includes('₹')) {
      cellClass += " font-semibold text-green-700 text-right";
    } else if (content.includes('%')) {
      cellClass += " font-medium text-blue-600 text-right";
    } else if (content.match(/^\d+$/)) {
      cellClass += " text-right font-mono";
    } else if (content.length > 50) {
      cellClass += " whitespace-normal max-w-xs";
    } else {
      cellClass += " whitespace-nowrap";
    }
    
    return (
      <td className={cellClass} {...props}>
        {children}
      </td>
    );
  },
  
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-amber-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0" {...props}>
      {children}
    </tr>
  ),
  
  // Lists
  ul: ({ children, ...props }: any) => (
    <ul className="space-y-2 mb-6 ml-4" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: any) => (
    <ol className="space-y-2 mb-6 ml-4 list-decimal" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: any) => (
    <li className="flex items-start space-x-3 text-gray-700" {...props}>
      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
      <span className="leading-relaxed">{children}</span>
    </li>
  ),
  
  // Code blocks
  code: ({ children, ...props }: any) => (
    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  
  pre: ({ children, ...props }: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 text-sm" {...props}>
      {children}
    </pre>
  ),
  
  // Blockquotes
  blockquote: ({ children, ...props }: any) => (
    <motion.blockquote
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="border-l-4 border-amber-400 bg-amber-50 p-6 mb-6 rounded-r-lg italic"
      {...props}
    >
      <div className="flex items-start space-x-3">
        <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
        <div className="text-gray-800 font-medium leading-relaxed">
          {children}
        </div>
      </div>
    </motion.blockquote>
  ),
  
  // Horizontal rules
  hr: ({ ...props }) => (
    <div className="my-12 flex items-center justify-center" {...props}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <div className="mx-4">
        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  ),
  
  // Strong/Bold text
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-gray-900 bg-amber-100 px-1 py-0.5 rounded" {...props}>
      {children}
    </strong>
  ),
  
  // Emphasis/Italic text
  em: ({ children, ...props }: any) => (
    <em className="italic text-amber-700 font-medium" {...props}>
      {children}
    </em>
  ),
};

export default function MarkdownRenderer({ 
  content, 
  reportType = 'salaried',
  className 
}: MarkdownRendererProps) {
  // Pre-process content to extract and render tables separately
  const processContentWithTables = (text: string) => {
    // Check if content contains tables
    if (!text.includes('|') || !text.includes('---')) {
      // No tables, render normally
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {text}
        </ReactMarkdown>
      );
    }

    // Split content by table blocks
    const parts = text.split(/(\n\n\|[^|]*\|[\s\S]*?\n\n)/);
    const processedParts: React.ReactNode[] = [];
    
    parts.forEach((part, index) => {
      if (part.includes('|') && part.includes('---')) {
        // This is a table
        processedParts.push(
          <MarkdownTable key={`table-${index}`} content={part.trim()} />
        );
      } else if (part.trim()) {
        // Regular markdown content
        processedParts.push(
          <ReactMarkdown
            key={`content-${index}`}
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {part}
          </ReactMarkdown>
        );
      }
    });
    
    return processedParts;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "prose prose-lg max-w-none",
        "prose-headings:text-gray-900",
        "prose-p:text-gray-700",
        "prose-strong:text-gray-900",
        "prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline",
        className
      )}
    >
      {processContentWithTables(content)}
    </motion.div>
  );
}
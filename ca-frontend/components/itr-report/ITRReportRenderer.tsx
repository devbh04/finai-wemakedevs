"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Shield, Calculator, Target, DollarSign, CheckCircle, Clock, Users } from 'lucide-react';
import ReportTable from './ReportTable';
import FinancialHighlight from './FinancialHighlight';
import TimelineProgress from './TimelineProgress';
import KeyTakeaways from './KeyTakeaways';
import ContentDebugger from './ContentDebugger';
import SmartTableRenderer from './SmartTableRenderer';
import TableTest from './TableTest';
import { parseMarkdownTable, debugTable } from './tableUtils';

interface ITRReportRendererProps {
  reportContent: string;
  reportType: 'BUSINESSMAN' | 'SALARIED' | 'SELF-EMPLOYED';
  generatedDate: string;
  task: string;
  caReportLength: number;
  documentsProcessed: number;
}

const ITRReportRenderer: React.FC<ITRReportRendererProps> = ({
  reportContent,
  reportType,
  generatedDate,
  task,
  caReportLength,
  documentsProcessed
}) => {
  const parseMarkdownContent = (content: string) => {
    // First, try to split by headers (## or #)
    let sections = content.split(/(?=^#{1,2}\s)/gm).filter(section => section.trim());
    
    // If no sections found with headers, create sections based on content patterns
    if (sections.length <= 1) {
      // Try splitting by numbered sections or other patterns
      const alternativeSplits = content.split(/(?=^\d+\.\s|\n\n(?=[A-Z][^a-z]*(?:\n|$)))/gm);
      if (alternativeSplits.length > 1) {
        sections = alternativeSplits;
      } else {
        // If still no sections, treat entire content as one section
        sections = [content];
      }
    }
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length === 0) return null;
      
      // Skip sections that are assumptions
      const firstLine = lines[0]?.toLowerCase() || '';
      if (firstLine.includes('assumption') || 
          firstLine.includes('disclaimer') ||
          section.toLowerCase().includes('## assumptions') ||
          section.toLowerCase().includes('# assumptions')) {
        return null;
      }
      
      let title = '';
      let sectionContent = '';
      let contentStartIndex = 0;
      
      // Find the first line that looks like a header
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^#{1,2}\s/)) {
          title = line.replace(/^#{1,2}\s/, '').trim();
          contentStartIndex = i + 1;
          break;
        } else if (line.match(/^\d+\.\s/) && i === 0) {
          title = line;
          contentStartIndex = i + 1;
          break;
        } else if (line.match(/^[A-Z][^a-z]*$/) && i === 0) {
          title = line;
          contentStartIndex = i + 1;
          break;
        }
      }
      
      // If no clear header found, use first meaningful line or create generic title
      if (!title) {
        if (lines[0] && lines[0].trim().length > 0) {
          title = lines[0].trim().length > 50 ? 
            lines[0].trim().substring(0, 50) + '...' : 
            lines[0].trim();
          contentStartIndex = 1;
        } else {
          title = `Section ${index + 1}`;
          contentStartIndex = 0;
        }
      }
      
      // Get content after the header
      sectionContent = lines.slice(contentStartIndex).join('\n').trim();
      
      // If no content after header, include the title line in content
      if (!sectionContent && lines.length > 0) {
        sectionContent = lines.join('\n').trim();
        title = title || `Content ${index + 1}`;
      }
      
      return { title, content: sectionContent };
    }).filter((section): section is { title: string; content: string } => 
      section !== null && (!!section.content || !!section.title)
    ); // Filter out null and empty sections with proper type guard
  };

  const sections = parseMarkdownContent(reportContent);

  const getThemeColors = (type: string) => {
    switch (type) {
      case 'BUSINESSMAN':
        return {
          primary: 'from-emerald-100 to-teal-50',
          secondary: 'from-emerald-50 to-green-50',
          accent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          header: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: 'text-emerald-600'
        };
      case 'SALARIED':
        return {
          primary: 'from-blue-100 to-indigo-50',
          secondary: 'from-blue-50 to-sky-50',
          accent: 'bg-blue-100 text-blue-800 border-blue-200',
          header: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: 'text-blue-600'
        };
      case 'SELF-EMPLOYED':
        return {
          primary: 'from-purple-100 to-pink-50',
          secondary: 'from-purple-50 to-violet-50',
          accent: 'bg-purple-100 text-purple-800 border-purple-200',
          header: 'bg-gradient-to-r from-purple-500 to-pink-500',
          icon: 'text-purple-600'
        };
      default:
        return {
          primary: 'from-slate-100 to-gray-50',
          secondary: 'from-slate-50 to-gray-50',
          accent: 'bg-slate-100 text-slate-800 border-slate-200',
          header: 'bg-gradient-to-r from-slate-500 to-gray-500',
          icon: 'text-slate-600'
        };
    }
  };

  const theme = getThemeColors(reportType);

  const renderTable = (tableContent: string, sectionType?: string) => {
    return (
      <SmartTableRenderer
        content={tableContent}
        theme={theme}
        sectionType={sectionType}
        fallbackToSimple={true}
      />
    );
  };

  const renderContent = (content: string, sectionTitle?: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let currentTable: string[] = [];
    let listItems: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip completely empty lines
      if (!trimmedLine) {
        return;
      }
      if (trimmedLine.includes('|') && trimmedLine.match(/^\s*\|[-\s|:]+\|\s*$/)) {
        // Table separator line - ignore but don't break table collection
        return;
      } else if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 2) {
        // More lenient check - any line with at least 2 parts when split by |
        currentTable.push(line);
      } else {
        // If we were building a table, render it
        if (currentTable.length > 0) {
          elements.push(
            <div key={`table-${index}`}>
              {renderTable(currentTable.join('\n'), sectionTitle)}
            </div>
          );
          currentTable = [];
        }

        // Handle list items (various formats)
        if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
          const listContent = trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '');
          listItems.push(listContent);
        } else {
          // If we were building a list, render it
          if (listItems.length > 0) {
            elements.push(
              <ul key={`list-${index}`} className="list-none space-y-2 my-4">
                {listItems.map((item, listIndex) => (
                  <li key={listIndex} className="flex items-start space-x-3">
                    <CheckCircle className={`w-4 h-4 mt-0.5 ${theme.icon} flex-shrink-0`} />
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            );
            listItems = [];
          }

          // Handle regular paragraphs and content
          if (trimmedLine) {
            if (trimmedLine.startsWith('####')) {
              elements.push(
                <h4 key={index} className="text-base font-semibold text-gray-800 mt-5 mb-2">
                  {trimmedLine.replace(/^#+\s*/, '')}
                </h4>
              );
            } else if (trimmedLine.startsWith('###')) {
              elements.push(
                <h3 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3 flex items-center">
                  <Target className={`w-5 h-5 mr-2 ${theme.icon}`} />
                  {trimmedLine.replace(/^#+\s*/, '')}
                </h3>
              );
            } else if (trimmedLine.startsWith('##')) {
              elements.push(
                <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
                  {trimmedLine.replace(/^#+\s*/, '')}
                </h2>
              );
            } else if (trimmedLine.startsWith('> ')) {
              elements.push(
                <div key={index} className={`border-l-4 border-blue-400 bg-gradient-to-r ${theme.secondary} p-4 my-4 rounded-r-lg`}>
                  <p className="text-gray-700 italic text-sm leading-relaxed">
                    {trimmedLine.substring(2)}
                  </p>
                </div>
              );
            } else if (trimmedLine.match(/^\\.*$/)) {
              // Handle escaped characters or special formatting
              elements.push(
                <p key={index} className="text-gray-600 text-xs italic my-2">
                  {trimmedLine.replace(/^\\/, '')}
                </p>
              );
            } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
              // Handle bold text
              elements.push(
                <p key={index} className="text-gray-800 font-semibold my-2 leading-relaxed text-sm">
                  {trimmedLine.replace(/\*\*/g, '')}
                </p>
              );
            } else if (trimmedLine.includes('**')) {
              // Handle mixed bold text
              elements.push(
                <p key={index} className="text-gray-700 my-2 leading-relaxed text-sm">
                  {trimmedLine.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={partIndex} className="font-semibold text-gray-800">{part.replace(/\*\*/g, '')}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            } else if (trimmedLine.includes('₹') || trimmedLine.includes('%')) {
              elements.push(
                <p key={index} className="text-gray-700 my-2 leading-relaxed text-sm">
                  {trimmedLine.split(/(₹[\d,]+|[\d.]+\s*%)/).map((part, partIndex) => {
                    if (part.startsWith('₹')) {
                      return <span key={partIndex} className="font-semibold text-green-600 bg-green-50 px-1 rounded">{part}</span>;
                    } else if (part.includes('%')) {
                      return <span key={partIndex} className="font-medium text-blue-600 bg-blue-50 px-1 rounded">{part}</span>;
                    }
                    return part;
                  })}
                </p>
              );
            } else if (trimmedLine.match(/^---+$/) || trimmedLine.match(/^===+$/)) {
              // Handle horizontal rules
              elements.push(
                <hr key={index} className="my-6 border-gray-300" />
              );
            } else if (trimmedLine.match(/^\*[^*].*[^*]\*$/) && !trimmedLine.includes('**')) {
              // Handle italic text
              elements.push(
                <p key={index} className="text-gray-700 italic my-2 leading-relaxed text-sm">
                  {trimmedLine.replace(/^\*|\*$/g, '')}
                </p>
              );
            } else {
              // Catch-all for any remaining text content
              const formattedText = trimmedLine;
              
              // Check if it's a line that should be emphasized (like section breaks or important notes)
              if (formattedText.match(/^[A-Z\s]+:$/)) {
                elements.push(
                  <div key={index} className="text-center text-gray-600 text-sm font-medium my-4 py-2 border-t border-gray-200">
                    {formattedText}
                  </div>
                );
              } else if (formattedText.match(/^\d+\.\d+\.\d+/) || formattedText.match(/^[A-Z]\.\d+/)) {
                // Handle subsection numbering
                elements.push(
                  <h5 key={index} className="text-sm font-medium text-gray-800 mt-4 mb-2">
                    {formattedText}
                  </h5>
                );
              } else if (formattedText.match(/^Prepared by:|^Date:|^All calculations/)) {
                // Handle footer/metadata content
                elements.push(
                  <div key={index} className="text-gray-500 text-xs italic my-2 p-2 bg-gray-50 rounded">
                    {formattedText}
                  </div>
                );
              } else if (formattedText.length > 0) {
                // Regular paragraph text - make sure this catches EVERYTHING else
                
                // Check if this line contains formatted content
                const hasSpecialContent = formattedText.includes('₹') || 
                                         formattedText.includes('%') || 
                                         formattedText.includes('**') ||
                                         formattedText.match(/\d{4}-\d{2}-\d{2}/) ||
                                         formattedText.includes('‑') || // en-dash
                                         formattedText.includes('–') || // em-dash
                                         formattedText.includes('•') ||
                                         formattedText.includes('→');
                
                if (hasSpecialContent) {
                  // Process the text with rich formatting
                  const processText = (text: string) => {
                    // First handle bold text
                    return text.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={`bold-${partIndex}`} className="font-semibold text-gray-800">{part.replace(/\*\*/g, '')}</strong>;
                      }
                      
                      // Then handle currency and percentages within non-bold parts
                      return part.split(/(₹[\d,]+(?:\.\d{2})?|[\d.]+\s*%|→|•)/).map((subPart, subIndex) => {
                        if (subPart.startsWith('₹')) {
                          return <span key={`currency-${partIndex}-${subIndex}`} className="font-semibold text-green-600 bg-green-50 px-1 rounded">{subPart}</span>;
                        } else if (subPart.includes('%')) {
                          return <span key={`percent-${partIndex}-${subIndex}`} className="font-medium text-blue-600 bg-blue-50 px-1 rounded">{subPart}</span>;
                        } else if (subPart === '→') {
                          return <span key={`arrow-${partIndex}-${subIndex}`} className="text-blue-500 font-medium mx-1">{subPart}</span>;
                        } else if (subPart === '•') {
                          return <span key={`bullet-${partIndex}-${subIndex}`} className="text-gray-500 mx-1">{subPart}</span>;
                        }
                        return subPart;
                      });
                    });
                  };
                  
                  elements.push(
                    <p key={index} className="text-gray-700 my-2 leading-relaxed text-sm">
                      {processText(formattedText)}
                    </p>
                  );
                } else {
                  // Regular paragraph text - handle common formatting characters
                  const cleanText = formattedText
                    .replace(/‑/g, '-') // Replace en-dash with regular dash
                    .replace(/–/g, '-') // Replace em-dash with regular dash
                    .replace(/'/g, "'") // Replace smart quotes
                    .replace(/"/g, '"')
                    .replace(/"/g, '"');
                  
                  elements.push(
                    <p key={index} className="text-gray-700 my-2 leading-relaxed text-sm">
                      {cleanText}
                    </p>
                  );
                }
              }
            }
          }
        }
      }
    });

    // Handle remaining table or list
    if (currentTable.length > 0) {
      elements.push(
        <div key="final-table">
          {renderTable(currentTable.join('\n'), sectionTitle)}
        </div>
      );
    }
    if (listItems.length > 0) {
      elements.push(
        <ul key="final-list" className="list-none space-y-2 my-4">
          {listItems.map((item, listIndex) => (
            <li key={listIndex} className="flex items-start space-x-3">
              <CheckCircle className={`w-4 h-4 mt-0.5 ${theme.icon} flex-shrink-0`} />
              <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('timeline') || lowerTitle.includes('implementation')) return Clock;
    if (lowerTitle.includes('calendar') || lowerTitle.includes('compliance')) return Calendar;
    if (lowerTitle.includes('investment') || lowerTitle.includes('80c') || lowerTitle.includes('nps')) return TrendingUp;
    if (lowerTitle.includes('tax') || lowerTitle.includes('regime') || lowerTitle.includes('calculation')) return Calculator;
    if (lowerTitle.includes('hra') || lowerTitle.includes('salary') || lowerTitle.includes('restructuring')) return Users;
    if (lowerTitle.includes('documentation') || lowerTitle.includes('compliance')) return Shield;
    if (lowerTitle.includes('emergency') || lowerTitle.includes('fund') || lowerTitle.includes('planning')) return DollarSign;
    if (lowerTitle.includes('wealth') || lowerTitle.includes('projection') || lowerTitle.includes('strategy')) return Target;
    if (lowerTitle.includes('summary') || lowerTitle.includes('action') || lowerTitle.includes('checklist')) return CheckCircle;
    
    return FileText;
  };

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ITR_Report_${reportType}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.primary}`}>
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${theme.header} text-white`}>
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  ITR Tax Reduction Report
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={theme.accent}>
                    {reportType}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {documentsProcessed} Document{documentsProcessed !== 1 ? 's' : ''} Processed
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className={`${theme.header} text-white hover:opacity-90 transition-opacity`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Report Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const IconComponent = getSectionIcon(section.title);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-6">
                    <div className={`p-2 rounded-lg ${theme.header} text-white mr-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                  </div>
                  
                  {/* Add timeline progress for timeline sections */}
                  {(section.title.toLowerCase().includes('timeline') || 
                    section.title.toLowerCase().includes('implementation')) && (
                    <TimelineProgress content={section.content} theme={theme} />
                  )}
                  
                  {/* Add financial highlights for sections with significant financial data */}
                  {(section.title.toLowerCase().includes('tax') || 
                    section.title.toLowerCase().includes('investment') || 
                    section.title.toLowerCase().includes('wealth') ||
                    section.title.toLowerCase().includes('summary')) && (
                    <FinancialHighlight content={section.content} theme={theme} />
                  )}
                  
                  {/* Add key takeaways for summary and action sections */}
                  {(section.title.toLowerCase().includes('summary') || 
                    section.title.toLowerCase().includes('action') || 
                    section.title.toLowerCase().includes('recommendation')) && (
                    <KeyTakeaways content={section.content} theme={theme} />
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    {renderContent(section.content, section.title)}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className={`p-6 bg-gradient-to-r ${theme.secondary} border-gray-200`}>
            <p className="text-gray-700 font-medium mb-2">
              Report generated by FinAI Tax Optimization System
            </p>
            <p className="text-sm text-gray-600">
              All calculations are based on current tax regulations and historical data. 
              Please consult with a qualified CA for implementation.
            </p>
          </Card>
        </motion.div>
      </div>

    </div>
  );
};

export default ITRReportRenderer;
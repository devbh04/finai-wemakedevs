import React from 'react';
import { TrendingUp, DollarSign, Percent, Calculator } from 'lucide-react';

interface FinancialHighlightProps {
  content: string;
  theme: {
    icon: string;
    secondary: string;
  };
}

const FinancialHighlight: React.FC<FinancialHighlightProps> = ({ content, theme }) => {
  const extractFinancialData = (text: string) => {
    const highlights: Array<{ value: string; label: string; type: 'currency' | 'percentage' | 'number' }> = [];
    
    // Extract currency amounts
    const currencyMatches = text.match(/₹[\d,]+(?:\.\d{2})?/g);
    if (currencyMatches) {
      currencyMatches.forEach(match => {
        const context = text.substring(
          Math.max(0, text.indexOf(match) - 50),
          text.indexOf(match) + match.length + 50
        );
        const label = extractLabel(context, match);
        highlights.push({ value: match, label, type: 'currency' });
      });
    }
    
    // Extract percentages
    const percentageMatches = text.match(/[\d.]+\s*%/g);
    if (percentageMatches) {
      percentageMatches.slice(0, 3).forEach(match => { // Limit to 3 percentages
        const context = text.substring(
          Math.max(0, text.indexOf(match) - 50),
          text.indexOf(match) + match.length + 50
        );
        const label = extractLabel(context, match);
        highlights.push({ value: match, label, type: 'percentage' });
      });
    }
    
    return highlights.slice(0, 4); // Limit to 4 highlights total
  };
  
  const extractLabel = (context: string, value: string) => {
    const beforeValue = context.substring(0, context.indexOf(value)).trim();
    const words = beforeValue.split(/\s+/).slice(-5); // Last 5 words before the value
    return words.join(' ').replace(/[^\w\s]/g, '').trim() || 'Amount';
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'currency': return DollarSign;
      case 'percentage': return Percent;
      default: return Calculator;
    }
  };
  
  const highlights = extractFinancialData(content);
  
  if (highlights.length === 0) return null;
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(highlights.length, 4)} gap-4 my-6 p-4 bg-gradient-to-r ${theme.secondary} rounded-lg border border-gray-200`}>
      {highlights.map((highlight, index) => {
        const IconComponent = getIcon(highlight.type);
        return (
          <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <IconComponent className={`w-5 h-5 ${theme.icon}`} />
            </div>
            <div className={`text-lg font-bold ${
              highlight.type === 'currency' ? 'text-green-600' : 
              highlight.type === 'percentage' ? 'text-blue-600' : 
              'text-gray-700'
            }`}>
              {highlight.value}
            </div>
            <div className="text-xs text-gray-600 mt-1 capitalize">
              {highlight.label.toLowerCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialHighlight;
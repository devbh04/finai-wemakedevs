import React from 'react';
import { CheckCircle, TrendingUp, Shield, Target } from 'lucide-react';

interface KeyTakeawaysProps {
  content: string;
  theme: {
    icon: string;
    secondary: string;
    header: string;
  };
}

const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({ content, theme }) => {
  const extractTakeaways = (text: string) => {
    const takeaways: Array<{ text: string; type: 'recommendation' | 'savings' | 'compliance' | 'planning' }> = [];
    
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      if (line.match(/^\d+\./) || line.startsWith('- ') || line.startsWith('• ')) {
        const cleanText = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
        
        let type: 'recommendation' | 'savings' | 'compliance' | 'planning' = 'recommendation';
        
        if (cleanText.toLowerCase().includes('save') || cleanText.toLowerCase().includes('tax') || cleanText.includes('₹')) {
          type = 'savings';
        } else if (cleanText.toLowerCase().includes('comply') || cleanText.toLowerCase().includes('file') || cleanText.toLowerCase().includes('deadline')) {
          type = 'compliance';
        } else if (cleanText.toLowerCase().includes('plan') || cleanText.toLowerCase().includes('wealth') || cleanText.toLowerCase().includes('future')) {
          type = 'planning';
        }
        
        takeaways.push({ text: cleanText, type });
      }
    });
    
    return takeaways.slice(0, 6); // Limit to 6 key takeaways
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return TrendingUp;
      case 'compliance': return Shield;
      case 'planning': return Target;
      default: return CheckCircle;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'savings': return 'bg-green-100 text-green-800 border-green-200';
      case 'compliance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const takeaways = extractTakeaways(content);
  
  if (takeaways.length === 0) return null;
  
  return (
    <div className="my-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <CheckCircle className={`w-5 h-5 mr-2 ${theme.icon}`} />
        Key Takeaways
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        {takeaways.map((takeaway, index) => {
          const TypeIcon = getTypeIcon(takeaway.type);
          const typeColor = getTypeColor(takeaway.type);
          
          return (
            <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className={`p-2 rounded-full ${typeColor}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {takeaway.text}
                </p>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${typeColor}`}>
                  {takeaway.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyTakeaways;
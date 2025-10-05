import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TimelineProgressProps {
  content: string;
  theme: {
    icon: string;
    secondary: string;
    header: string;
  };
}

const TimelineProgress: React.FC<TimelineProgressProps> = ({ content, theme }) => {
  const extractTimelineItems = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: Array<{ month: string; action: string; status: 'completed' | 'current' | 'upcoming' }> = [];
    
    let currentMonth = '';
    
    lines.forEach(line => {
      // Check if line contains month information
      const monthMatch = line.match(/M[‑-]?(\d+)|Month\s*(\d+)|(\w+)\s*\d{4}/i);
      if (monthMatch) {
        currentMonth = line.trim();
        
        // Determine status based on month (simplified logic)
        const monthNum = monthMatch[1] || monthMatch[2];
        const currentDate = new Date();
        const currentMonthNum = currentDate.getMonth() + 1;
        
        let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
        if (monthNum && parseInt(monthNum) < currentMonthNum) status = 'completed';
        else if (monthNum && parseInt(monthNum) === currentMonthNum) status = 'current';
        
        items.push({
          month: currentMonth,
          action: '',
          status
        });
      } else if (line.includes('|') && currentMonth) {
        // Extract action from table row
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length > 1 && cells[1] && !cells[1].includes('Action')) {
          const lastItem = items[items.length - 1];
          if (lastItem && lastItem.month === currentMonth) {
            lastItem.action = cells[1];
          }
        }
      }
    });
    
    return items.filter(item => item.action).slice(0, 12); // Limit to 12 items
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'current': return Clock;
      default: return AlertCircle;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const timelineItems = extractTimelineItems(content);
  
  if (timelineItems.length === 0) return null;
  
  return (
    <div className="my-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className={`w-5 h-5 mr-2 ${theme.icon}`} />
        Implementation Progress
      </h4>
      
      <div className="space-y-4">
        {timelineItems.map((item, index) => {
          const StatusIcon = getStatusIcon(item.status);
          const statusColor = getStatusColor(item.status);
          
          return (
            <div key={index} className="flex items-start space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className={`p-2 rounded-full ${statusColor}`}>
                <StatusIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">
                  {item.month}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {item.action}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                {item.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineProgress;
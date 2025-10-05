import React from 'react';

interface ContentDebuggerProps {
  sections: Array<{ title: string; content: string }>;
  originalContent: string;
}

const ContentDebugger: React.FC<ContentDebuggerProps> = ({ sections, originalContent }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const totalContentLength = sections.reduce((sum, section) => sum + section.content.length, 0);
  const contentCoverage = ((totalContentLength / originalContent.length) * 100).toFixed(1);

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-black bg-opacity-90 text-white text-xs p-4 rounded-lg z-50 max-h-96 overflow-y-auto">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-2">
        <div>
          <strong>Original length:</strong> {originalContent.length}
        </div>
        <div>
          <strong>Sections found:</strong> {sections.length}
        </div>
        <div>
          <strong>Content coverage:</strong> {contentCoverage}%
        </div>
        {parseFloat(contentCoverage) < 80 && (
          <div className="text-yellow-400">⚠️ Low content coverage - some text may be missing</div>
        )}
        {sections.map((section, index) => (
          <div key={index} className="border-t border-gray-600 pt-2">
            <div><strong>#{index + 1}:</strong> {section.title.length > 40 ? section.title.substring(0, 40) + '...' : section.title}</div>
            <div><strong>Content:</strong> {section.content.length} chars</div>
            {section.content.includes('|') && (
              <div className="text-blue-400">
                📊 Contains tables ({section.content.split('\n').filter(line => line.includes('|')).length} rows)
              </div>
            )}
            {(section.content.includes('₹') || section.content.includes('%')) && (
              <div className="text-green-400">💰 Contains financial data</div>
            )}
            {section.content.length === 0 && (
              <div className="text-red-400">⚠️ Empty content</div>
            )}
            {section.content.length < 50 && section.content.length > 0 && (
              <div className="text-orange-400">⚠️ Very short content</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs">
        <button 
          onClick={() => console.log('Full original content:', originalContent)}
          className="text-blue-400 hover:text-blue-300"
        >
          Log full content to console
        </button>
      </div>
    </div>
  );
};

export default ContentDebugger;
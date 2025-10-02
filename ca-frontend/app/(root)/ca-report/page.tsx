"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Calendar, User } from "lucide-react";

interface AnalysisResult {
  task: string;
  result: string;
  markdown: string;
  file_saved?: string;
}

export default function CAReport() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the analysis result from localStorage
    const storedResult = localStorage.getItem("caAnalysisResult");
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult);
        setAnalysisResult(result);
      } catch (error) {
        console.error("Error parsing analysis result:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleBackToHome = () => {
    // Clear the stored result and go back
    localStorage.removeItem("caAnalysisResult");
    window.location.href = "/";
  };

  const handleDownloadReport = () => {
    if (analysisResult?.markdown) {
      const blob = new Blob([analysisResult.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CA_Analysis_Report_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analysis report...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center max-w-md mx-auto p-6">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Report Found</h2>
          <p className="text-gray-600 mb-6">
            It looks like there's no analysis report available. Please go back and upload your documents first.
          </p>
          <Button onClick={handleBackToHome} className="bg-amber-600 hover:bg-amber-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Parse the result content to create a better display
  const formatContent = (content: string) => {
    // Split by lines and process
    const lines = content.split('\n');
    let formattedContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#')) {
        // Headers
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, '');
        formattedContent += `<h${level} class="text-${4-level}xl font-bold text-gray-800 mt-6 mb-3">${text}</h${level}>`;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold text
        const text = line.replace(/^\*\*|\*\*$/g, '');
        formattedContent += `<p class="font-semibold text-gray-700 mt-2 mb-2">${text}</p>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // List items
        const text = line.replace(/^[-*]\s/, '');
        formattedContent += `<li class="ml-4 mb-1 text-gray-600">• ${text}</li>`;
      } else if (line.length > 0) {
        // Regular paragraphs
        formattedContent += `<p class="text-gray-600 mb-3 leading-relaxed">${line}</p>`;
      } else {
        // Empty lines
        formattedContent += '<br>';
      }
    }
    
    return formattedContent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Fixed Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToHome} 
                variant="outline" 
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">CA Analysis Report</h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleDownloadReport}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-amber-200"
        >
          {/* Report Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Financial Analysis Report</h2>
                <p className="text-amber-100 flex items-center mt-1">
                  <User className="h-4 w-4 mr-1" />
                  Task: {analysisResult.task}
                </p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(analysisResult.result) 
                }}
                className="space-y-4"
              />
            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>This report was generated using AI analysis of your uploaded documents.</p>
              <p className="mt-1">For professional advice, please consult with a qualified Chartered Accountant.</p>
            </div>
          </div>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-white rounded-lg p-6 shadow-md border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleBackToHome}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upload More Documents
              </Button>
              <Button 
                onClick={handleDownloadReport}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Save Report
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
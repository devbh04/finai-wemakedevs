"use client";
import React, { useState, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface ITRAlertDialogProps {
  children: React.ReactNode;
}

export function ITRAlertDialog({ children }: ITRAlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [caMarkdown, setCaMarkdown] = useState<string>('');
  const [caReportAttached, setCaReportAttached] = useState<boolean>(false);
  const [clientType, setClientType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing CA analysis report when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      const storedResult = localStorage.getItem('caAnalysisResult');
      if (storedResult) {
        try {
          const result = JSON.parse(storedResult);
          // Extract the markdown content from the stored result
          if (result.markdown) {
            setCaMarkdown(result.markdown);
            setCaReportAttached(true);
            // Try to extract client type from the result
            if (result.client_category || result.client_type) {
              setClientType(result.client_category || result.client_type);
            }
            console.log('CA Analysis report found and attached');
          }
        } catch (error) {
          console.error('Error parsing stored CA analysis result:', error);
        }
      }
    }
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type === "application/pdf");
    
    if (validFiles.length === 0 && files.length > 0) {
      alert("Please select valid PDF files only");
      return;
    }
    
    setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    const validFiles = files.filter(file => file.type === "application/pdf");
    
    if (validFiles.length === 0 && files.length > 0) {
      alert("Please select valid PDF files only");
      return;
    }
    
    setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleSubmitITR = async () => {
    if (!caMarkdown.trim()) {
      alert("Please ensure CA analysis report is available. Run CA analysis first or enter markdown content.");
      return;
    }

    if (!clientType.trim()) {
      alert("Please select a client type (salaried, self-employed, or businessman)");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('client_type', clientType);
      formData.append('ca_markdown', caMarkdown);
      
      // Add uploaded PDF files
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });
      } else {
        // Add a dummy file if no files uploaded (API expects files parameter)
        const dummyFile = new File([''], 'dummy.txt', { type: 'text/plain' });
        formData.append('files', dummyFile);
      }

      const response = await fetch('http://127.0.0.1:8000/itr/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze ITR');
      }

      const result = await response.json();
      console.log('ITR Analysis Result:', result);
      
      // Store result and navigate to ITR report page
      localStorage.setItem('itrAnalysisResult', JSON.stringify(result));
      window.location.href = '/itr-report';
      
    } catch (error) {
      console.error('ITR Analysis failed:', error);
      alert('Failed to analyze ITR. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUploadedFiles([]);
    // Don't clear caMarkdown if it was loaded from localStorage
    if (!caReportAttached) {
      setCaMarkdown('');
    }
    setIsOpen(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center text-amber-700 mb-2 flex items-center justify-center gap-2">
            🏛️ ITR Helper - Tax Optimization Assistant
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-600">
            Get personalized ITR recommendations based on your CA analysis. Upload additional PDF documents for comprehensive tax optimization strategies.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* CA Report Status Section */}
          <div className={`border-2 rounded-lg p-4 ${caReportAttached ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <div className="flex items-center justify-center">
              {caReportAttached ? (
                <div className="text-center text-green-700">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                  <span className="font-medium">CA Analysis Report Attached</span>
                  <p className="text-sm mt-1">Using existing CA analysis from your session</p>
                  {clientType && <p className="text-xs mt-1">Client Type: {clientType}</p>}
                </div>
              ) : (
                <div className="text-center text-red-700">
                  <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">No CA Analysis Found</span>
                  <p className="text-sm mt-1">Please run CA analysis first or enter content manually below</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Type Selection */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Type (required):
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['salaried', 'self-employed', 'businessman'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setClientType(type)}
                  className={`px-3 py-2 text-sm rounded-md border ${
                    clientType === type
                      ? 'bg-amber-100 border-amber-500 text-amber-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* PDF File Upload Section */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
            <div 
              className="text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <Upload className="mx-auto h-12 w-12 text-blue-500" />
              </div>
              <div className="mb-4">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload Your Financial PDF Documents
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Drag & drop or click to select PDF files
                </span>
              </div>
              
              {/* Show uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Manual Input Section - Only show if no CA report attached */}
          {!caReportAttached && (
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste your CA analysis markdown content manually:
              </label>
              <textarea
                value={caMarkdown}
                onChange={(e) => setCaMarkdown(e.target.value)}
                placeholder="Paste your CA's markdown analysis here... 

Example:
# Financial Analysis Report
## Income Details
- Annual Income: ₹12,00,000
- Tax Bracket: 30%
...
"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
              />
              <p className="mt-2 text-xs text-gray-500">
                This will be used to generate personalized ITR recommendations
              </p>
            </div>
          )}

          {/* Preview Section */}
          {caMarkdown.trim() && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                CA Analysis Preview:
              </h4>
              <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                {caMarkdown.slice(0, 300)}...
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Length: {caMarkdown.length} characters | 
                Source: {caReportAttached ? 'Attached CA Report' : 'Manual Input'}
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmitITR}
            disabled={!caMarkdown.trim() || !clientType.trim() || isLoading || uploadedFiles.length === 0}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing ITR...
              </div>
            ) : (
              <>
                🎯 Optimize My ITR
                {uploadedFiles.length > 0 && (
                  <span className="ml-1 text-xs">({uploadedFiles.length} PDF{uploadedFiles.length > 1 ? 's' : ''})</span>
                )}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

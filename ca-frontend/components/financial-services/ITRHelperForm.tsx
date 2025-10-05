"use client";
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  ArrowLeft,
  X
} from 'lucide-react';

interface ITRHelperFormProps {
  onBack: () => void;
  onClose: () => void;
}

export function ITRHelperForm({ onBack, onClose }: ITRHelperFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [caMarkdown, setCaMarkdown] = useState<string>('');
  const [caReportAttached, setCaReportAttached] = useState<boolean>(false);
  const [clientType, setClientType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing CA analysis report
  React.useEffect(() => {
    const storedResult = localStorage.getItem('caAnalysisResult');
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult);
        if (result.markdown) {
          setCaMarkdown(result.markdown);
          setCaReportAttached(true);
          if (result.client_category || result.client_type) {
            setClientType(result.client_category || result.client_type);
          }
        }
      } catch (error) {
        console.error('Error parsing stored CA analysis result:', error);
      }
    }
  }, []);

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

    if (uploadedFiles.length === 0) {
      alert("Please upload at least one PDF document for analysis");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('client_type', clientType);
      formData.append('ca_markdown', caMarkdown);
      
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://127.0.0.1:8000/itr/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze ITR');
      }

      const result = await response.json();
      console.log('ITR Analysis Result:', result);
      
      localStorage.setItem('itrAnalysisResult', JSON.stringify(result));
      window.location.href = '/itr-report';
      
    } catch (error) {
      console.error('ITR Analysis failed:', error);
      alert('Failed to analyze ITR. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      {/* CA Report Status */}
      <Card className={`border-2 ${caReportAttached ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
        <CardContent className="p-4">
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
                <X className="mx-auto h-8 w-8 mb-2" />
                <span className="font-medium">No CA Analysis Found</span>
                <p className="text-sm mt-1">Please run CA analysis first or enter content manually below</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Type Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {['salaried', 'self-employed', 'businessman'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setClientType(type)}
                className={`px-4 py-3 text-sm rounded-lg border-2 transition-all ${
                  clientType === type
                    ? 'bg-amber-100 border-amber-500 text-amber-700 font-medium'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Financial Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Your Financial PDF Documents
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag & drop or click to select PDF files
              </p>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Manual Input Section - Only show if no CA report attached */}
      {!caReportAttached && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manual CA Analysis Input</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={caMarkdown}
              onChange={(e) => setCaMarkdown(e.target.value)}
              placeholder="Paste your CA's markdown analysis here... 

Example:
# Financial Analysis Report
## Income Details
- Annual Income: ₹12,00,000
- Tax Bracket: 30%
..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
            />
            <p className="mt-2 text-xs text-gray-500">
              This will be used to generate personalized ITR recommendations
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitITR}
          disabled={!caMarkdown.trim() || !clientType.trim() || isLoading || uploadedFiles.length === 0}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
        </Button>
      </div>
    </div>
  );
}
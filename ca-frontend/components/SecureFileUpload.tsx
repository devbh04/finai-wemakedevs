"use client";
import React, { useState, useRef } from 'react';
import { Upload, Shield, Lock, Unlock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { useFileUploadStore } from '@/lib/store';
import axios from 'axios';

interface SecureFileUploadProps {
  onUploadComplete: (sessionId: string, accessToken: string) => void;
  onAccessGranted: (processingKey: string) => void;
  clientType: string;
  // Optional: files already selected via the organizer component
  externalFiles?: File[];
}

export default function SecureFileUpload({ 
  onUploadComplete, 
  onAccessGranted, 
  clientType,
  externalFiles = []
}: SecureFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'creating_session' | 'uploading' | 'uploaded' | 'access_granted'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    secureSession,
    uploadedFiles,
    isAccessGranted,
    setSecureSession,
    setUploadedFiles,
    grantAccess,
    resetSecureState
  } = useFileUploadStore();

  // Compute remaining files from organizer that haven't been uploaded yet
  const remainingExternalFiles = (externalFiles || []).filter((f) =>
    !uploadedFiles?.some((u: any) => u?.filename === f.name)
  );

  const createSecureSession = async () => {
    try {
      setUploadStatus('creating_session');
      setStatusMessage('Creating secure session...');
      setError('');

      const response = await axios.post('http://127.0.0.1:8000/create-session');
      
      if (response.data.status === 'success') {
        setSecureSession(response.data.session);
        setStatusMessage('Secure session created successfully');
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to create session');
      }
    } catch (error: any) {
      setError(`Session creation failed: ${error.response?.data?.error || error.message}`);
      setUploadStatus('idle');
      throw error;
    }
  };

  // Core uploader that takes an array of File
  const performUpload = async (filesArray: File[]) => {
    try {
      // Create session if not exists
      let session = secureSession;
      if (!session) {
        session = await createSecureSession();
      }

      if (!session) {
        throw new Error('Failed to create or retrieve session');
      }

      setUploadStatus('uploading');
      setStatusMessage('Encrypting and uploading files securely...');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('upload_session_id', session.upload_session_id);
      formData.append('access_token', session.access_token);

      // Add all files to form data
      filesArray.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(
        'http://127.0.0.1:8000/upload-secure',
        formData,
        {
          // Do NOT set Content-Type manually; let the browser add the correct boundary
          timeout: 120000, // 2 minutes timeout
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total 
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          }
        }
      );

      if (response.data.status === 'success') {
        // Merge with existing uploaded files, de-duplicating by filename
        const incoming = response.data.uploaded_files || [];
        const combined = [...(uploadedFiles || []), ...incoming];
        const deduped = combined.filter((item, index, self) =>
          index === self.findIndex((t: any) => t?.filename === item?.filename)
        );
        setUploadedFiles(deduped);
        setUploadStatus('uploaded');
        setStatusMessage(`Successfully uploaded ${response.data.uploaded_files.filter((f: any) => f.encrypted).length} files securely`);
        onUploadComplete(session.upload_session_id, session.access_token);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }

    } catch (error: any) {
      setError(`Upload failed: ${error.response?.data?.error || error.message}`);
      setUploadStatus('idle');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    await performUpload(Array.from(files));
  };

  const handleGrantAccess = async () => {
    if (!secureSession) {
      setError('No active session found');
      return;
    }

    try {
      setStatusMessage('Granting access to encrypted files...');

      const response = await axios.post('http://127.0.0.1:8000/grant-access', {
        upload_session_id: secureSession.upload_session_id,
        access_token: secureSession.access_token
      });

      if (response.data.status === 'success') {
        grantAccess(response.data.processing_key);
        setUploadStatus('access_granted');
        setStatusMessage('Access granted! Files are ready for analysis.');
        onAccessGranted(response.data.processing_key);
      } else {
        throw new Error(response.data.message || 'Access grant failed');
      }

    } catch (error: any) {
      setError(`Access grant failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Clear input for re-upload
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const resetUpload = () => {
    resetSecureState();
    setUploadStatus('idle');
    setStatusMessage('');
    setError('');
    setUploadProgress(0);
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'creating_session':
        return <Clock className="animate-spin w-5 h-5 text-blue-500" />;
      case 'uploading':
        return <Upload className="animate-bounce w-5 h-5 text-blue-500" />;
      case 'uploaded':
        return <Lock className="w-5 h-5 text-orange-500" />;
      case 'access_granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Shield className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Secure Document Upload</h2>
        </div>
        <p className="text-sm text-gray-600">
          Your financial documents are encrypted before upload and stored securely
        </p>
      </div>

      {/* Upload pre-selected (organized) files */}
      {uploadStatus === 'idle' && externalFiles && externalFiles.length > 0 && (
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-700">
              {externalFiles.length} document{externalFiles.length !== 1 ? 's' : ''} selected in organizer
            </p>
            <Button
              onClick={() => performUpload(externalFiles)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload selected documents securely
            </Button>
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <div className="flex items-center mb-2">
          {getStatusIcon()}
          <span className="ml-2 font-medium text-gray-800">
            {uploadStatus === 'idle' ? 'Ready to Upload' : 
             uploadStatus === 'creating_session' ? 'Creating Session' :
             uploadStatus === 'uploading' ? 'Uploading' :
             uploadStatus === 'uploaded' ? 'Files Encrypted & Uploaded' :
             'Access Granted'}
          </span>
        </div>
        
        {statusMessage && (
          <p className="text-sm text-gray-600 mb-2">{statusMessage}</p>
        )}
        
        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}

        {/* Offer to upload remaining organizer files after initial upload */}
        {uploadStatus === 'uploaded' && !isAccessGranted && remainingExternalFiles.length > 0 && (
          <div className="mt-3">
            <Button
              onClick={() => performUpload(remainingExternalFiles)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload {remainingExternalFiles.length} additional document{remainingExternalFiles.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {uploadStatus === 'uploading' && uploadProgress > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}
      </div>

      {/* Upload Area */}
      {uploadStatus === 'idle' && (
        <div
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Upload Financial Documents
          </h3>
          <p className="text-gray-600 mb-4">
            Click or drag & drop your files here
          </p>
          <p className="text-xs text-gray-500">
            Supported: PDF, JPG, PNG • Files will be encrypted automatically
          </p>
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center">
                  {file.encrypted ? (
                    <Lock className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium">{file.filename}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {file.encrypted ? 'Encrypted ✓' : file.error || 'Failed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {uploadStatus === 'uploaded' && !isAccessGranted && (
          <Button
            onClick={handleGrantAccess}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <Unlock className="w-5 h-5 mr-2" />
            Grant Access to Decrypt Files
          </Button>
        )}

        {uploadStatus === 'access_granted' && (
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 font-semibold mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              Files Ready for Analysis
            </div>
            <p className="text-sm text-gray-600">
              Proceed to analyze your documents
            </p>
          </div>
        )}

        {(uploadStatus === 'uploaded' || uploadStatus === 'access_granted') && (
          <Button
            onClick={resetUpload}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Upload Different Files
          </Button>
        )}
      </div>

      {/* Security Information */}
      <div className="mt-6 p-4 bg-blue-100 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🔒 Security Features</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Files are encrypted with AES-256 before upload</li>
          <li>• Stored securely in AWS S3 with additional encryption</li>
          <li>• Access requires explicit user consent</li>
          <li>• Files are automatically deleted after processing</li>
          <li>• No permanent storage of sensitive data</li>
        </ul>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
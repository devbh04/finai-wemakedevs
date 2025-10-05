"use client";
import { useRef, useEffect, useState } from "react";
import { Upload, FileCheck2, Trash2, Shield, Key } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";
import { useFileUploadStore } from "@/lib/store";

interface FileUploadProps {
    onFileAssign: (optionName: string, file: File) => void;
    onFileRemove?: (optionName: string) => void;
    optionFileNames: string[];
    requiredDocs?: string[];
    optionalDocs?: string[];
    enableEncryption?: boolean;
    onEncryptedUploadComplete?: (sessionData: any) => void;
    showGrantAccessButton?: boolean;
    onGrantAccess?: () => void;
    isGrantingAccess?: boolean;
}

export default function FileUpload({ 
    onFileAssign, 
    onFileRemove, 
    optionFileNames = [], 
    requiredDocs = [], 
    optionalDocs = [],
    enableEncryption = false,
    onEncryptedUploadComplete,
    showGrantAccessButton = false,
    onGrantAccess,
    isGrantingAccess = false
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Local state for encryption flow
    const [encryptionMode, setEncryptionMode] = useState(false);
    const [encryptedFiles, setEncryptedFiles] = useState<{[key: string]: boolean}>({});
    const [uploadSession, setUploadSession] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showGrantAccess, setShowGrantAccess] = useState(false);
    
    // Zustand store hooks
    const {
        files,
        activeOption,
        setActiveOption,
        addFile,
        removeFile,
        getFileForOption,
        getPreviewUrlForOption,
        getAllAssignedOptions,
        secureSession,
        uploadedFiles,
        isAccessGranted,
        setSecureSession,
        setUploadedFiles,
        grantAccess,
        resetSecureState
    } = useFileUploadStore();

    const processNewFile = async (file: File) => {
        if (!activeOption) {
            alert("Please select an option first before uploading.");
            return;
        }

        if (file && (file.type === "application/pdf" || file.type === "image/png" || file.type === "image/jpeg")) {
            if (enableEncryption) {
                await handleEncryptedUpload(file);
            } else {
                // Regular file upload
                addFile(activeOption, file);
                onFileAssign(activeOption, file);
            }
        } else {
            alert("Please select a valid PDF, JPG, or PNG file.");
        }
    };

    const handleEncryptedUpload = async (file: File) => {
        if (!activeOption) return;
        
        try {
            setIsUploading(true);
            
            // For FileUpload component, we'll just mark file as encrypted and let parent handle upload
            // This is because the main upload logic is handled in the parent component (page.tsx)
            
            // Mark file as encrypted and add to regular file store for preview
            setEncryptedFiles(prev => ({ ...prev, [activeOption as string]: true }));
            addFile(activeOption, file);
            onFileAssign(activeOption, file);

            console.log(`File ${file.name} marked as encrypted for ${activeOption}`);

        } catch (error: any) {
            console.error('Encryption setup failed:', error);
            alert(`Encryption setup failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGrantAccess = async () => {
        // Delegate to parent component handler if provided
        if (onGrantAccess) {
            onGrantAccess();
        } else {
            alert('Grant access handler not configured');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processNewFile(file);
        }
        if (event.target) {
            event.target.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file && activeOption) {
            processNewFile(file);
        }
    };

    const handleUnassignFile = (optionName: string) => {
        // Remove from Zustand store
        removeFile(optionName);
        
        // Remove from encrypted files tracking
        if (encryptedFiles[optionName]) {
            setEncryptedFiles(prev => {
                const newState = { ...prev };
                delete newState[optionName];
                return newState;
            });
        }
        
        // Notify parent component
        if (onFileRemove) {
            onFileRemove(optionName);
        }
    };

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(files).forEach(fileData => {
                if (fileData.previewUrl) {
                    URL.revokeObjectURL(fileData.previewUrl);
                }
            });
        };
    }, []);

    const assignedFileForActiveOption = activeOption ? getFileForOption(activeOption) : null;
    const previewUrlForActiveOption = activeOption ? getPreviewUrlForOption(activeOption) : null;
    const fileTypeForActiveOption = assignedFileForActiveOption?.file?.type || null;
    const assignedOptions = getAllAssignedOptions();
    
    return (
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto min-h-[600px] lg:h-[70vh] p-2 sm:p-4 bg-amber-50/10 border-2 border-amber-400 rounded-lg shadow-lg shadow-amber-200 gap-3 sm:gap-4">
            {/* Options */}
            <div className="w-full lg:w-1/3 flex flex-col lg:min-w-[300px] lg:max-w-[400px]">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 px-2 text-gray-800">Required Documents</h3>
                <div className="flex-1 p-2 sm:p-3 overflow-y-auto bg-white border border-amber-200 rounded-lg shadow-sm">
                    <div className="space-y-3">
                        {optionFileNames.map(optionName => {
                            const isAssigned = !!getFileForOption(optionName);
                            const isActive = activeOption === optionName;
                            const isRequired = requiredDocs.includes(optionName);
                            const isOptional = optionalDocs.includes(optionName);

                            return (
                                <div
                                    key={optionName}
                                    onClick={() => setActiveOption(optionName)}
                                    className={`cursor-pointer w-full p-2 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                                        isActive ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' : 'border-gray-200 hover:border-gray-300'
                                    } ${
                                        isAssigned
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-medium text-xs sm:text-sm">{optionName}</span>
                                            {isAssigned && <FileCheck2 size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />}
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                            {encryptedFiles[optionName] && (
                                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex items-center gap-1 ${
                                                    isAssigned ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    <Shield size={10} />
                                                    Encrypted
                                                </span>
                                            )}
                                            {isRequired && (
                                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${
                                                    isAssigned ? 'bg-green-800 text-green-100' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    Required
                                                </span>
                                            )}
                                            {isOptional && (
                                                <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${
                                                    isAssigned ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    Optional
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Upload/Preview */}
            <div className="flex-1 flex flex-col bg-white border border-amber-200 rounded-xl shadow-sm min-w-0 mt-4 lg:mt-0 overflow-hidden">
                {!activeOption ? (
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-[200px] lg:max-h-[calc(70vh-40px)]">
                        <div className="text-center text-gray-500">
                            <div className="mb-4">
                                <Upload size={48} className="mx-auto text-gray-300 sm:w-16 sm:h-16" />
                            </div>
                            <p className="text-base sm:text-lg font-medium mb-2">Select a document option to begin</p>
                            {assignedOptions.length > 0 && (
                                <p className="text-sm text-green-600 font-medium">
                                    ✅ {assignedOptions.length} document(s) uploaded
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl gap-2 sm:gap-4">
                            <div className="flex-1">
                                <h4 className="font-semibold text-base sm:text-lg text-gray-900">{activeOption}</h4>
                                <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                                    {requiredDocs.includes(activeOption) && (
                                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-red-100 text-red-800 font-medium">
                                            Required
                                        </span>
                                    )}
                                    {optionalDocs.includes(activeOption) && (
                                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                            Optional
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {encryptedFiles[activeOption] && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg">
                                        <Shield size={12} />
                                        <span className="text-xs font-medium">Encrypted</span>
                                    </div>
                                )}
                                {assignedFileForActiveOption && (
                                    <button
                                        onClick={() => handleUnassignFile(activeOption)}
                                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-xs sm:text-sm font-medium self-end sm:self-auto"
                                    >
                                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main content area */}
                        <div className="flex-1 flex flex-col lg:flex-row min-h-0 max-h-none lg:max-h-[calc(70vh-120px)]">
                            {/* Upload/Preview for active option */}
                            <div className="flex-1 p-2 sm:p-4 min-w-0 w-full">
                                {assignedFileForActiveOption && previewUrlForActiveOption ? (
                                    <div className="h-[300px] sm:h-[400px] lg:h-full lg:max-h-[calc(70vh-160px)] w-full max-w-full border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                        {fileTypeForActiveOption === "application/pdf" ? (
                                            <div className="w-full h-full relative bg-gray-100">
                                                {/* Mobile PDF Fallback - Show on small screens */}
                                                <div className="flex lg:hidden w-full h-full items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg">
                                                    <div className="text-center p-4">
                                                        <div className="text-red-600 text-3xl mb-3">📄</div>
                                                        <p className="text-red-600 font-semibold mb-2 text-lg">PDF Document</p>
                                                        <p className="text-red-500 text-sm mb-3 break-words px-2">
                                                            {assignedFileForActiveOption?.file?.name}
                                                        </p>
                                                        <p className="text-xs text-red-400 mb-3">
                                                            PDF preview unavailable on mobile
                                                        </p>
                                                        <a 
                                                            href={previewUrlForActiveOption} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-block px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                        >
                                                            View PDF
                                                        </a>
                                                    </div>
                                                </div>
                                                {/* Desktop PDF Preview - Show on large screens */}
                                                <div className="hidden lg:block w-full h-full">
                                                    <iframe 
                                                        src={`${previewUrlForActiveOption}#view=FitH&toolbar=0&navpanes=0`}
                                                        className="w-full h-full border-none" 
                                                        title="PDF Preview"
                                                        style={{ 
                                                            minHeight: '400px',
                                                            width: '100%',
                                                            height: '100%'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative bg-white">
                                                {/* Zoom Controls */}
                                                <div className="absolute top-2 right-2 z-10 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const img = document.getElementById(`preview-img-${activeOption}`) as HTMLImageElement;
                                                            const container = img?.parentElement?.parentElement;
                                                            if (img && container) {
                                                                const currentScale = img.style.transform ? parseFloat(img.style.transform.replace('scale(', '').replace(')', '')) : 1;
                                                                const newScale = Math.min(currentScale + 0.5, 3);
                                                                img.style.transform = `scale(${newScale})`;
                                                                img.style.transformOrigin = 'center center';
                                                            }
                                                        }}
                                                        className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 border border-gray-300 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                                                        title="Zoom In"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="11" cy="11" r="8"/>
                                                            <path d="m21 21-4.35-4.35"/>
                                                            <line x1="11" y1="8" x2="11" y2="14"/>
                                                            <line x1="8" y1="11" x2="14" y2="11"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const img = document.getElementById(`preview-img-${activeOption}`) as HTMLImageElement;
                                                            const container = img?.parentElement?.parentElement;
                                                            if (img && container) {
                                                                const currentScale = img.style.transform ? parseFloat(img.style.transform.replace('scale(', '').replace(')', '')) : 1;
                                                                const newScale = Math.max(currentScale - 0.5, 0.5);
                                                                img.style.transform = `scale(${newScale})`;
                                                                img.style.transformOrigin = 'center center';
                                                                if (newScale === 1) {
                                                                    container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 border border-gray-300 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                                                        title="Zoom Out"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="11" cy="11" r="8"/>
                                                            <path d="m21 21-4.35-4.35"/>
                                                            <line x1="8" y1="11" x2="14" y2="11"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const img = document.getElementById(`preview-img-${activeOption}`) as HTMLImageElement;
                                                            const container = img?.parentElement?.parentElement;
                                                            if (img && container) {
                                                                img.style.transform = 'scale(1)';
                                                                img.style.transformOrigin = 'center center';
                                                                container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                                                            }
                                                        }}
                                                        className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 border border-gray-300 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                                                        title="Reset Zoom"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                                            <path d="M3 3v5h5"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                {/* Image Container */}
                                                <div className="w-full h-full overflow-auto p-2 sm:p-4">
                                                    <div className="flex items-center justify-center min-h-full">
                                                        <img 
                                                            id={`preview-img-${activeOption}`}
                                                            src={previewUrlForActiveOption} 
                                                            alt="File Preview" 
                                                            className="rounded-lg shadow-sm block transition-transform duration-300 ease-in-out"
                                                            style={{ 
                                                                maxWidth: 'none',
                                                                maxHeight: 'none',
                                                                minWidth: '200px',
                                                                minHeight: '150px',
                                                                width: 'auto',
                                                                height: 'auto',
                                                                display: 'block',
                                                                transformOrigin: 'center center'
                                                            }}
                                                            onLoad={() => console.log('Image loaded successfully')}
                                                            onError={(e) => console.error('Image failed to load:', e)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className={`w-full h-[280px] sm:h-[350px] lg:h-full lg:max-h-[calc(70vh-160px)] border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200 p-4 ${
                                            isUploading 
                                                ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-wait' 
                                                : enableEncryption 
                                                    ? 'border-blue-300 text-blue-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                                                    : 'border-gray-300 text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={!isUploading ? handleDrop : undefined}
                                    >
                                        {enableEncryption ? (
                                            <Shield size={36} className="mx-auto mb-3 text-blue-400 sm:w-12 sm:h-12" />
                                        ) : (
                                            <Upload size={36} className="mx-auto mb-3 text-gray-400 sm:w-12 sm:h-12" />
                                        )}
                                        <p className="font-medium text-center mb-2 text-sm sm:text-base px-2">
                                            {enableEncryption ? "Secure upload" : "Upload document"} for: <span className="text-blue-600 font-semibold break-words">{activeOption}</span>
                                        </p>
                                        <p className="text-xs sm:text-sm text-center mb-1">
                                            {isUploading ? "Encrypting and uploading..." : "Click or drag & drop a file here"}
                                        </p>
                                        <p className="text-xs text-center text-gray-400">
                                            {enableEncryption ? "Files will be encrypted before upload" : "Supported: PDF, JPG, PNG (max 10MB)"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar showing all uploaded files */}
                            {assignedOptions.length > 0 && (
                                <div className="w-full lg:w-80 lg:min-w-[300px] lg:max-w-[350px] lg:border-l border-t lg:border-t-0 border-gray-200 bg-gray-50 mt-4 lg:mt-0">
                                    <div className="h-full flex flex-col">
                                        <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                                            <h5 className="font-semibold text-gray-900 text-sm">Uploaded Files</h5>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {assignedOptions.length} of {optionFileNames.length} uploaded
                                            </p>
                                        </div>
                                        <div className="flex-1 p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto">
                                            {assignedOptions.map((optionName) => {
                                            const fileData = getFileForOption(optionName);
                                            const file = fileData?.file;
                                            const previewUrl = fileData?.previewUrl;
                                            const isCurrentActive = optionName === activeOption;
                                            
                                            return (
                                                <div 
                                                    key={optionName}
                                                    className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                        isCurrentActive 
                                                            ? 'border-blue-500 bg-blue-100 shadow-md ring-2 ring-blue-200' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                                    onClick={() => setActiveOption(optionName)}
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        {/* Preview thumbnail */}
                                                        <div className="w-full h-16 sm:h-20 lg:h-24 flex-shrink-0 bg-gray-100 rounded border overflow-hidden">
                                                            {file?.type === "application/pdf" ? (
                                                                <div className="w-full h-full bg-red-100 flex items-center justify-center">
                                                                    <div className="text-center">
                                                                        <div className="text-red-600 text-sm sm:text-base lg:text-lg font-bold">PDF</div>
                                                                        <div className="text-red-500 text-xs">Document</div>
                                                                    </div>
                                                                </div>
                                                            ) : previewUrl ? (
                                                                <img 
                                                                    src={previewUrl} 
                                                                    alt="Preview" 
                                                                    className="w-full h-full object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">No Preview</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* File info */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-gray-900 truncate mb-1">
                                                                {optionName}
                                                            </p>
                                                            <p className="text-xs text-gray-600 truncate mb-1 sm:mb-2">
                                                                {file?.name || 'Unknown file'}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {encryptedFiles[optionName] && (
                                                                    <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                                                                        <Shield size={10} />
                                                                        Encrypted
                                                                    </span>
                                                                )}
                                                                {requiredDocs.includes(optionName) && (
                                                                    <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                                        Required
                                                                    </span>
                                                                )}
                                                                {optionalDocs.includes(optionName) && (
                                                                    <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                                        Optional
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="application/pdf,image/png,image/jpeg"
                    className="hidden"
                />
            </div>
        </div>
    );
}
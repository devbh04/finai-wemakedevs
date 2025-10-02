"use client";
import SplitText from "@/components/SplitText";
import {MovingBorderButton } from "@/components/ui/moving-border";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { useState, useEffect } from "react";
import { useFileUploadStore } from "@/lib/store";
import { DocTypes } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function Home() {
  const texts = [
    "Your CA, Reimagined",
    "Smarter Tax Savings",
    "Stocks Made Simple",
    "Invest Where It Counts",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Zustand store
  const { files, clearAllFiles } = useFileUploadStore();
  
  // Convert Zustand files to legacy format for compatibility
  const assignedFiles = Object.fromEntries(
    Object.entries(files).map(([optionName, fileData]) => [optionName, fileData.file])
  );

  const handleAnimationComplete = () => {
    // Wait a bit after animation completes, then move to next text
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      setKey((prev) => prev + 1); // Force re-render of SplitText
    }, 1000); // 1 second pause between texts
  };

  const handleFileAssigned = (optionName: string, file: File) => {
    console.log(`File for "${optionName}" received in parent:`, file.name);
    // File is already managed by Zustand store, no need to manage local state
  };

  const handleFileRemoved = (optionName: string) => {
    console.log(`File for "${optionName}" removed in parent`);
    // File is already removed from Zustand store, no need to manage local state
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      for (const [optionName, file] of Object.entries(assignedFiles)) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("model", optionName);

        const response = await axios.post(
          "http://127.0.0.1:8000/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log(`${optionName} upload response:`, response.data);
      }
      alert("All files uploaded successfully!");
    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Get document configuration based on selected occupation
  const getDocumentConfig = () => {
    if (!selectedButton) return null;
    return DocTypes[selectedButton as keyof typeof DocTypes] || DocTypes.default;
  };

  const documentConfig = getDocumentConfig();

  return (
    <div className="min-h-screen w-full bg-black relative">
      {/* Fixed gradient background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(125% 125% at 50% 80%, #ffffff 40%, #f59e0b 100%)
      `,
          backgroundSize: "100% 100%",
        }}
      />
      {/* Scrollable content */}
      <div className="relative z-10 min-h-screen">
        <div className="flex flex-col items-center justify-start pt-8 sm:pt-12 lg:pt-16 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <MovingBorderButton
              borderRadius="1.75rem"
              className="p-2 sm:p-4 bg-amber-600/10 dark:bg-slate-900 text-amber-600 dark:text-white border-amber-600 dark:border-slate-800 text-xs sm:text-sm"
            >
              Not Backed By Y Combinator
            </MovingBorderButton>
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">FinAI</h1>
            <div className="min-h-[100px] flex items-center justify-center">
              <SplitText
                key={key} // Force re-render when key changes
                text={texts[currentIndex]}
                className="text-3xl text-center font-bold text-gray-800"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                tag="h3"
                onLetterAnimationComplete={handleAnimationComplete}
              />
            </div>
          </div>
          <div className="text-center text-gray-600 px-4 sm:px-0">
            Your AI-powered Chartered Accountant for effortless tax savings,
            smart investments, and financial growth.
          </div>
          <div className="border-b border-gray-300 my-6 sm:my-10" />
          <div className="mt-4 flex flex-col items-center justify-center px-4 sm:px-0">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">What is your source of income?</p>
            <p className="mt-2 text-sm">Select One</p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
            {selectedButton === "self-employed" ? (
              <RainbowButton className="w-full sm:w-60 text-base sm:text-lg">Self Employed</RainbowButton>
            ) : (
              <Button 
                className="w-full sm:w-60 text-base sm:text-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelectedButton("self-employed")}
              >
                Self Employed
              </Button>
            )}
            
            {selectedButton === "salaried" ? (
              <RainbowButton className="w-full sm:w-60 text-base sm:text-lg">Salaried</RainbowButton>
            ) : (
              <Button 
                className="w-full sm:w-60 text-base sm:text-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelectedButton("salaried")}
              >
                Salaried
              </Button>
            )}
            
            {selectedButton === "businessman" ? (
              <RainbowButton className="w-full sm:w-60 text-base sm:text-lg">Businessman</RainbowButton>
            ) : (
              <Button 
                className="w-full sm:w-60 text-base sm:text-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelectedButton("businessman")}
              >
                Businessman
              </Button>
            )}
          </div>

          {/* File Upload Section - Show only when occupation is selected */}
          <AnimatePresence mode="wait">
            {selectedButton && documentConfig && (
              <motion.div 
                key={selectedButton}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="mt-8 sm:mt-12 w-full max-w-7xl mx-auto px-4 sm:px-0"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center mb-4 sm:mb-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Upload {documentConfig.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
                    Please upload the required documents for verification and processing
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="w-full overflow-hidden drop-shadow-xl drop-shadow-amber-200"
                >
                  <FileUpload
                    optionFileNames={[...documentConfig.options, ...(documentConfig.relatedDocs || [])]}
                    requiredDocs={documentConfig.options}
                    optionalDocs={documentConfig.relatedDocs || []}
                    onFileAssign={handleFileAssigned}
                    onFileRemove={handleFileRemoved}
                  />
                </motion.div>

                {/* Upload Progress Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {documentConfig.options.length > 0 && (
                    <div className="mt-4 sm:mt-6 w-full max-w-4xl mx-auto">
                      <div className="bg-amber-100/10 rounded-lg p-3 sm:p-4 border border-amber-300 shadow-md shadow-amber-200">
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">📊 Upload Progress</h3>
                    
                    {/* Required Documents Progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm mb-3 gap-2 sm:gap-0">
                      <span className="text-gray-600">
                        Required: {documentConfig.options.filter(doc => assignedFiles[doc]).length} of {documentConfig.options.length} uploaded
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${documentConfig.options.length > 0 ? (documentConfig.options.filter(doc => assignedFiles[doc]).length / documentConfig.options.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {documentConfig.options.length > 0 ? Math.round((documentConfig.options.filter(doc => assignedFiles[doc]).length / documentConfig.options.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* Optional Documents Progress */}
                    {documentConfig.relatedDocs && documentConfig.relatedDocs.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
                        <span className="text-gray-600">
                          Optional: {documentConfig.relatedDocs.filter(doc => assignedFiles[doc]).length} of {documentConfig.relatedDocs.length} uploaded
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(documentConfig.relatedDocs.filter(doc => assignedFiles[doc]).length / documentConfig.relatedDocs.length) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-green-600 font-medium">
                            {Math.round((documentConfig.relatedDocs.filter(doc => assignedFiles[doc]).length / documentConfig.relatedDocs.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

                  {/* Upload Button Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex justify-center mt-4 sm:mt-6 w-full max-w-4xl mx-auto"
                  >
                    <div className="text-center">
                      {/* Status Message */}
                      <div className="mb-3 sm:mb-4">
                        {documentConfig.options.length > 0 && (
                          <div className="text-xs sm:text-sm text-gray-600 mb-2 px-2 sm:px-0">
                            {documentConfig.options.filter(doc => assignedFiles[doc]).length === documentConfig.options.length ? (
                              <span className="text-green-600 font-medium">
                                ✅ All required documents uploaded! 
                                {documentConfig.relatedDocs && documentConfig.relatedDocs.filter(doc => assignedFiles[doc]).length > 0 && 
                                  ` (+${documentConfig.relatedDocs.filter(doc => assignedFiles[doc]).length} optional)`
                                }
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">
                                ⚠️ {documentConfig.options.length - documentConfig.options.filter(doc => assignedFiles[doc]).length} required document{documentConfig.options.length - documentConfig.options.filter(doc => assignedFiles[doc]).length !== 1 ? 's' : ''} remaining
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleUpload}
                        disabled={loading || documentConfig.options.filter(doc => assignedFiles[doc]).length !== documentConfig.options.length}
                        className="cursor-pointer bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-colors text-sm sm:text-lg w-full sm:w-auto"
                      >
                        {loading ? (
                          "Uploading..."
                        ) : (
                          `Upload ${Object.keys(assignedFiles).length} Document${Object.keys(assignedFiles).length !== 1 ? 's' : ''}`
                        )}
                      </Button>

                      {/* Upload Info */}
                      <div className="mt-2 sm:mt-3 text-xs text-gray-500 px-2 sm:px-0">
                        {documentConfig.options.length > 0 && documentConfig.options.filter(doc => assignedFiles[doc]).length !== documentConfig.options.length ? (
                          "Upload all required documents to proceed"
                        ) : (
                          "Ready to upload! Optional documents will be included automatically."
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

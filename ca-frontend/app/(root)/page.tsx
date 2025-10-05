"use client";
import { MovingBorderButton } from "@/components/ui/moving-border";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { MorphingText } from "@/components/ui/morphing-text";
import { useState, useEffect } from "react";
import { useFileUploadStore } from "@/lib/store";
import { DocTypes } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ChevronRight, Shield } from "lucide-react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { Highlighter } from "@/components/ui/highlighter";
import ITRHelperButton from "@/components/itr-helper/ITRHelperButton";
import { Input } from "@/components/ui/input";

export default function Home() {
  const texts = [
    "Your CA, Reimagined",
    "Smarter Tax Savings",
    "Stocks Made Simple",
    "Invest Where It Counts",
  ];
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useEncryption, setUseEncryption] = useState(false);
  const [uploadSession, setUploadSession] = useState<any>(null);

  // Zustand store
  const { files, addFile } = useFileUploadStore();

  // Enable smooth scrolling with better performance
  useEffect(() => {
    // Set smooth scrolling with CSS
    document.documentElement.style.scrollBehavior = "smooth";

    // Optimize scroll performance
    document.documentElement.style.scrollPaddingTop = "20px";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.style.scrollPaddingTop = "";
    };
  }, []);

  // Removed auto-scroll assistance to give users full control over scrolling

  // Convert Zustand files to legacy format for compatibility
  const assignedFiles = Object.fromEntries(
    Object.entries(files).map(([optionName, fileData]) => [
      optionName,
      fileData.file,
    ])
  );

  const handleFileAssigned = (optionName: string, file: File) => {
    console.log(`File for "${optionName}" received in parent:`, file.name);
    // File is already managed by Zustand store, no need to manage local state
  };

  const handleFileRemoved = (optionName: string) => {
    console.log(`File for "${optionName}" removed in parent`);
    // File is already removed from Zustand store, no need to manage local state
  };

  // File upload handlers for quick upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    selectedFiles.forEach((file, index) => {
      addFile(`file_${index}`, file);
    });
  };

  const handleSecureFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    selectedFiles.forEach((file, index) => {
      addFile(`file_${index}`, file);
    });
  };

  const handleEncryptedUploadComplete = (analysisResult: any) => {
    console.log("Encrypted analysis complete:", analysisResult);
    
    // Store the result in localStorage to pass to ca-report page
    localStorage.setItem("caAnalysisResult", JSON.stringify(analysisResult));
    
    // Navigate to ca-report page
    window.location.href = "/ca-report";
  };

  const handleSecureUpload = async () => {
    if (!selectedButton) {
      alert("Please select an occupation type first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Map frontend button values to backend expected values
      const clientTypeMapping: { [key: string]: string } = {
        salaried: "salaried",
        "self-employed": "self_employed",
        businessman: "business",
      };

      const clientType = clientTypeMapping[selectedButton] || selectedButton;
      formData.append("client_type", clientType);

      // Add all uploaded files
      Object.values(assignedFiles).forEach((file) => {
        formData.append("files", file);
      });

      console.log("Starting secure upload...");
      console.log("Frontend button:", selectedButton);
      console.log("Backend client_type:", clientType);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Step 1: Secure upload
      const uploadResponse = await axios.post(
        `${apiUrl}/secure/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
          withCredentials: false,
        }
      );

      console.log("Secure upload response:", uploadResponse.data);
      
      if (uploadResponse.data.status === "success") {
        // Store session data
        const sessionData = {
          upload_session_id: uploadResponse.data.upload_session_id,
          access_token: uploadResponse.data.access_token
        };
        setUploadSession(sessionData);
        
        // Step 2: Grant access and process (optimized single call)
        const grantFormData = new FormData();
        grantFormData.append('access_token', uploadResponse.data.access_token);
        grantFormData.append('client_type', clientType);

        const grantResponse = await axios.post(
          `${apiUrl}/secure/session/${uploadResponse.data.upload_session_id}/grant`,
          grantFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 240000,
          }
        );

        console.log("Grant and process response:", grantResponse.data);
        
        // Store the result and navigate
        localStorage.setItem("caAnalysisResult", JSON.stringify(grantResponse.data));
        window.location.href = "/ca-report";
      } else {
        throw new Error(uploadResponse.data.message || "Upload failed");
      }
      
    } catch (error: any) {
      console.error('Secure processing failed:', error);
      alert(`Secure processing failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedButton) {
      alert("Please select an occupation type first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Map frontend button values to backend expected values
      const clientTypeMapping: { [key: string]: string } = {
        salaried: "salaried",
        "self-employed": "self_employed",
        businessman: "business",
      };

      const clientType = clientTypeMapping[selectedButton] || selectedButton;
      formData.append("client_type", clientType);

      // Add all uploaded files
      Object.values(assignedFiles).forEach((file) => {
        formData.append("files", file);
      });

      console.log("Uploading files:", Object.keys(assignedFiles));
      console.log("Frontend button:", selectedButton);
      console.log("Backend client_type:", clientType);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(
        `${apiUrl}/ca/analyze`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 240000, // 240 seconds timeout for analysis
          withCredentials: false, // Handle CORS
        }
      );

      console.log("Analysis response:", response.data);

      // Store the result in localStorage to pass to ca-report page
      localStorage.setItem("caAnalysisResult", JSON.stringify(response.data));

      // Navigate to ca-report page
      window.location.href = "/ca-report";
    } catch (err: any) {
      console.error("Analysis failed:", err.response?.data || err.message);
      alert(`Analysis failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get document configuration based on selected occupation
  const getDocumentConfig = () => {
    if (!selectedButton) return null;
    return (
      DocTypes[selectedButton as keyof typeof DocTypes] || DocTypes.default
    );
  };

  const documentConfig = getDocumentConfig();

  const scrollToOccupations = () => {
    const occupationSection = document.getElementById("occupation-section");
    if (occupationSection) {
      // Use a more gentle scroll with offset for better visual positioning
      const offset = 20; // Small offset from top for better visual spacing
      const elementPosition = occupationSection.offsetTop - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="w-full bg-white relative"
      style={{ scrollBehavior: "smooth" }}
    >
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
      {/* Bottom Fade Grid Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
      `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
        }}
      />

      {/* Hero Section - Centered */}
      <div
        id="hero-section"
        className="relative z-10 min-h-screen flex items-center justify-center"
      >
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
              <span
                className={cn(
                  "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
                )}
                style={{
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "destination-out",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "subtract",
                  WebkitClipPath: "padding-box",
                }}
              />
              🏆 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
              <AnimatedGradientText className="text-sm font-medium">
                Not Backed By Y Combinator
              </AnimatedGradientText>
              <ChevronRight className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-gray-800 mb-8">
            FinAI
          </h1>

          <div className="min-h-[80px] flex items-center justify-center">
            <MorphingText
              texts={texts}
              className="text-3xl sm:text-4xl lg:text-5xl text-center font-bold text-gray-800"
            />
          </div>

          <p className="text-xl space-y-4 sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your{" "}
            <Highlighter action="underline" color="#FF9800">
              AI-powered Chartered Accountant
            </Highlighter>{" "}
            for effortless{" "}
            <Highlighter action="highlight" color="#87CEFA">
              tax savings
            </Highlighter>{" "}
            ,{" "}
            <Highlighter action="highlight" color="#87CEFA">
              smart investments
            </Highlighter>{" "}
            , and{" "}
            <Highlighter action="highlight" color="#87CEFA">
              financial growth
            </Highlighter>
            .
          </p>

          <Button
            onClick={scrollToOccupations}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-6 px-8 rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started →
          </Button>

          {/* Bouncing Down Arrow */}
          <div className="mt-12 flex justify-center">
            <div
              className="animate-bounce cursor-pointer"
              onClick={scrollToOccupations}
            >
              <svg
                className="w-8 h-8 text-neutral-400 hover:text-neutral-500 transition-colors duration-200"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Occupation Selection Section */}
      <div
        id="occupation-section"
        className="relative z-10 min-h-screen py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              What is your source of income?
            </h2>
            <p className="text-lg text-gray-600 mb-4">Select one to get started</p>
            
            {/* Encryption Toggle */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-sm text-gray-600">Standard Upload</span>
              <button
                onClick={() => setUseEncryption(!useEncryption)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  useEncryption ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useEncryption ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Secure Encrypted Upload
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {useEncryption 
                ? "Files will be encrypted before upload for maximum security" 
                : "Standard file upload with HTTPS protection"
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            {selectedButton === "self-employed" ? (
              <RainbowButton className="w-full sm:w-64 text-lg py-4">
                Self Employed
              </RainbowButton>
            ) : (
              <Button
                className="w-full sm:w-64 text-lg py-4 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => setSelectedButton("self-employed")}
              >
                Self Employed
              </Button>
            )}

            {selectedButton === "salaried" ? (
              <RainbowButton className="w-full sm:w-64 text-lg py-4">
                Salaried
              </RainbowButton>
            ) : (
              <Button
                className="w-full sm:w-64 text-lg py-4 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => setSelectedButton("salaried")}
              >
                Salaried
              </Button>
            )}

            {selectedButton === "businessman" ? (
              <RainbowButton className="w-full sm:w-64 text-lg py-4">
                Businessman
              </RainbowButton>
            ) : (
              <Button
                className="w-full sm:w-64 text-lg py-4 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => setSelectedButton("businessman")}
              >
                Businessman
              </Button>
            )}
          </div>

          {/* Master File Upload Section - Show when occupation is selected */}
          <AnimatePresence mode="wait">
            {selectedButton && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-8 w-full max-w-4xl mx-auto"
              >
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {useEncryption ? "🔐" : "🚀"} {useEncryption ? "Secure" : "Quick"} Upload for{" "}
                      {selectedButton.charAt(0).toUpperCase() +
                        selectedButton.slice(1).replace("-", " ")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {useEncryption 
                        ? "Upload all your documents with end-to-end encryption for secure analysis"
                        : "Upload all your documents at once for instant analysis"
                      }
                    </p>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                        <Input
                          type="file"
                          onChange={useEncryption ? handleSecureFileUpload : handleFileUpload}
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                          className={`flex-1 cursor-pointer bg-white transition-colors duration-200 ${
                            useEncryption 
                              ? "border-blue-300 hover:border-blue-400 focus:border-blue-500"
                              : "border-gray-300 hover:border-blue-400 focus:border-blue-500"
                          }`}
                          disabled={loading}
                        />                    {Object.keys(assignedFiles).length > 0 && (
                      <div className="w-full">
                        <div className="text-center mb-3">
                          <span className="text-sm text-green-600 font-medium">
                            ✅ {Object.keys(assignedFiles).length} file(s) ready
                            for analysis
                          </span>
                        </div>

                        <Button
                          onClick={useEncryption ? handleSecureUpload : handleUpload}
                          disabled={loading}
                          className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 ${
                            useEncryption 
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          }`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>{useEncryption ? "Encrypting & Analyzing..." : "Analyzing Documents..."}</span>
                            </div>
                          ) : (
                            `${useEncryption ? "🔐 Secure Analyze" : "🔍 Analyze"} ${
                              Object.keys(assignedFiles).length
                            } Document${
                              Object.keys(assignedFiles).length !== 1 ? "s" : ""
                            }`
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          {selectedButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center justify-center my-8"
            >
              <div className="flex items-center space-x-4">
                <div className="h-px bg-gray-300 w-16"></div>
                <span className="text-sm text-gray-500 font-medium">OR</span>
                <div className="h-px bg-gray-300 w-16"></div>
              </div>
            </motion.div>
          )}

          {/* Detailed File Upload Section - Show only when occupation is selected */}
          <AnimatePresence mode="wait">
            {selectedButton && documentConfig && (
              <motion.div
                key={selectedButton}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
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
                    📋 Organize {documentConfig.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
                    Upload and organize documents by category for detailed
                    tracking
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="w-full overflow-hidden drop-shadow-xl drop-shadow-amber-200"
                >
                  <FileUpload
                    optionFileNames={[
                      ...documentConfig.options,
                      ...(documentConfig.relatedDocs || []),
                    ]}
                    requiredDocs={documentConfig.options}
                    optionalDocs={documentConfig.relatedDocs || []}
                    onFileAssign={handleFileAssigned}
                    onFileRemove={handleFileRemoved}
                    enableEncryption={useEncryption}
                    onEncryptedUploadComplete={handleEncryptedUploadComplete}
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
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                          📊 Upload Progress
                        </h3>

                        {/* Required Documents Progress */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm mb-3 gap-2 sm:gap-0">
                          <span className="text-gray-600">
                            Required:{" "}
                            {
                              documentConfig.options.filter(
                                (doc) => assignedFiles[doc]
                              ).length
                            }{" "}
                            of {documentConfig.options.length} uploaded
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    documentConfig.options.length > 0
                                      ? (documentConfig.options.filter(
                                          (doc) => assignedFiles[doc]
                                        ).length /
                                          documentConfig.options.length) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-blue-600 font-medium">
                              {documentConfig.options.length > 0
                                ? Math.round(
                                    (documentConfig.options.filter(
                                      (doc) => assignedFiles[doc]
                                    ).length /
                                      documentConfig.options.length) *
                                      100
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                        </div>

                        {/* Optional Documents Progress */}
                        {documentConfig.relatedDocs &&
                          documentConfig.relatedDocs.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
                              <span className="text-gray-600">
                                Optional:{" "}
                                {
                                  documentConfig.relatedDocs.filter(
                                    (doc) => assignedFiles[doc]
                                  ).length
                                }{" "}
                                of {documentConfig.relatedDocs.length} uploaded
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${
                                        (documentConfig.relatedDocs.filter(
                                          (doc) => assignedFiles[doc]
                                        ).length /
                                          documentConfig.relatedDocs.length) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-green-600 font-medium">
                                  {Math.round(
                                    (documentConfig.relatedDocs.filter(
                                      (doc) => assignedFiles[doc]
                                    ).length /
                                      documentConfig.relatedDocs.length) *
                                      100
                                  )}
                                  %
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
                            {documentConfig.options.filter(
                              (doc) => assignedFiles[doc]
                            ).length === documentConfig.options.length ? (
                              <span className="text-green-600 font-medium">
                                ✅ All required documents uploaded!
                                {documentConfig.relatedDocs &&
                                  documentConfig.relatedDocs.filter(
                                    (doc) => assignedFiles[doc]
                                  ).length > 0 &&
                                  ` (+${
                                    documentConfig.relatedDocs.filter(
                                      (doc) => assignedFiles[doc]
                                    ).length
                                  } optional)`}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">
                                ⚠️{" "}
                                {documentConfig.options.length -
                                  documentConfig.options.filter(
                                    (doc) => assignedFiles[doc]
                                  ).length}{" "}
                                required document
                                {documentConfig.options.length -
                                  documentConfig.options.filter(
                                    (doc) => assignedFiles[doc]
                                  ).length !==
                                1
                                  ? "s"
                                  : ""}{" "}
                                remaining
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={useEncryption ? handleSecureUpload : handleUpload}
                        disabled={
                          loading ||
                          documentConfig.options.filter(
                            (doc) => assignedFiles[doc]
                          ).length !== documentConfig.options.length
                        }
                        className="cursor-pointer bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-colors text-sm sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{useEncryption ? "Securely Processing..." : "Analyzing Documents..."}</span>
                          </div>
                        ) : (
                          <>
                            {useEncryption ? <Shield className="h-4 w-4" /> : <span>🔍</span>}
                            {useEncryption ? 
                              `🔒 Secure Analyze ${Object.keys(assignedFiles).length} Document${Object.keys(assignedFiles).length !== 1 ? "s" : ""}` :
                              `🔍 Analyze ${Object.keys(assignedFiles).length} Document${Object.keys(assignedFiles).length !== 1 ? "s" : ""}`
                            }
                          </>
                        )}
                      </Button>

                      {/* Upload Info */}
                      <div className="mt-2 sm:mt-3 text-xs text-gray-500 px-2 sm:px-0">
                        {useEncryption ? (
                          "Secure encryption mode enabled"
                        ) : documentConfig.options.length > 0 &&
                        documentConfig.options.filter(
                          (doc) => assignedFiles[doc]
                        ).length !== documentConfig.options.length
                          ? "Upload all required documents to proceed with analysis"
                          : "Ready for analysis! Optional documents will be included automatically."}
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
  );
}
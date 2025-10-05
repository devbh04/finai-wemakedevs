import { create } from 'zustand';

interface FileData {
  file: File;
  previewUrl: string;
  fileName: string;
}

interface SecureSession {
  upload_session_id: string;
  access_token: string;
}

interface UploadedFile {
  filename: string;
  s3_key?: string;
  encrypted: boolean;
  error?: string;
}

interface FileUploadState {
  // File data indexed by option name
  files: { [optionName: string]: FileData };
  activeOption: string | null;
  
  // Secure upload state
  secureSession: SecureSession | null;
  uploadedFiles: UploadedFile[];
  isAccessGranted: boolean;
  processingKey: string | null;
  
  // Actions
  setActiveOption: (option: string | null) => void;
  addFile: (optionName: string, file: File) => void;
  removeFile: (optionName: string) => void;
  clearAllFiles: () => void;
  getFileForOption: (optionName: string) => FileData | null;
  getPreviewUrlForOption: (optionName: string) => string | null;
  getAllAssignedOptions: () => string[];
  
  // Secure upload actions
  setSecureSession: (session: SecureSession) => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  grantAccess: (processingKey: string) => void;
  resetSecureState: () => void;
}

export const useFileUploadStore = create<FileUploadState>((set, get) => ({
  files: {},
  activeOption: null,
  
  // Secure upload state
  secureSession: null,
  uploadedFiles: [],
  isAccessGranted: false,
  processingKey: null,

  setActiveOption: (option) => set({ activeOption: option }),

  addFile: (optionName, file) => {
    // Clean up existing file for this option if it exists
    const existingFile = get().files[optionName];
    if (existingFile?.previewUrl) {
      URL.revokeObjectURL(existingFile.previewUrl);
    }

    // Create unique filename with timestamp to avoid conflicts
    const fileName = `${optionName}_${Date.now()}_${file.name}`;
    const previewUrl = URL.createObjectURL(file);

    set(state => ({
      files: {
        ...state.files,
        [optionName]: {
          file,
          previewUrl,
          fileName
        }
      }
    }));
  },

  removeFile: (optionName) => {
    const existingFile = get().files[optionName];
    if (existingFile?.previewUrl) {
      URL.revokeObjectURL(existingFile.previewUrl);
    }

    set(state => {
      const newFiles = { ...state.files };
      delete newFiles[optionName];
      return { files: newFiles };
    });
  },

  clearAllFiles: () => {
    // Clean up all preview URLs
    const files = get().files;
    Object.values(files).forEach(fileData => {
      if (fileData.previewUrl) {
        URL.revokeObjectURL(fileData.previewUrl);
      }
    });

    set({ files: {}, activeOption: null });
  },

  getFileForOption: (optionName) => {
    return get().files[optionName] || null;
  },

  getPreviewUrlForOption: (optionName) => {
    return get().files[optionName]?.previewUrl || null;
  },

  getAllAssignedOptions: () => {
    return Object.keys(get().files);
  },

  // Secure upload actions
  setSecureSession: (session) => set({ secureSession: session }),

  setUploadedFiles: (files) => set({ uploadedFiles: files }),

  grantAccess: (processingKey) => set({ 
    isAccessGranted: true, 
    processingKey 
  }),

  resetSecureState: () => set({
    secureSession: null,
    uploadedFiles: [],
    isAccessGranted: false,
    processingKey: null
  })
}));
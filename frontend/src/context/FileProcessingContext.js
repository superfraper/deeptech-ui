import React, { createContext, useContext, useState, useEffect } from 'react';

const FileProcessingContext = createContext();

export const useFileProcessing = () => {
  const context = useContext(FileProcessingContext);
  if (!context) {
    throw new Error(
      'useFileProcessing must be used within a FileProcessingProvider'
    );
  }
  return context;
};

export const FileProcessingProvider = ({ children }) => {
  const [processingFiles, setProcessingFiles] = useState(new Set());
  const [abortControllers, setAbortControllers] = useState(new Map());

  // Check if any files are currently being processed
  const isProcessingFiles = processingFiles.size > 0;

  // Add a file to the processing list
  const addProcessingFile = (fileName, abortController = null) => {
    setProcessingFiles(prev => new Set(prev).add(fileName));
    if (abortController) {
      setAbortControllers(prev => new Map(prev).set(fileName, abortController));
    }
  };

  // Remove a file from the processing list
  const removeProcessingFile = fileName => {
    setProcessingFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
    setAbortControllers(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileName);
      return newMap;
    });
  };

  // Abort processing for a specific file
  const abortFileProcessing = fileName => {
    const controller = abortControllers.get(fileName);
    if (controller) {
      controller.abort();
      removeProcessingFile(fileName);
      return true;
    }
    return false;
  };

  // Abort all file processing
  const abortAllFileProcessing = () => {
    abortControllers.forEach((controller, fileName) => {
      controller.abort();
    });
    setProcessingFiles(new Set());
    setAbortControllers(new Map());
  };

  // Get list of currently processing files
  const getProcessingFiles = () => Array.from(processingFiles);

  const value = {
    isProcessingFiles,
    processingFiles,
    addProcessingFile,
    removeProcessingFile,
    abortFileProcessing,
    abortAllFileProcessing,
    getProcessingFiles,
  };

  return (
    <FileProcessingContext.Provider value={value}>
      {children}
    </FileProcessingContext.Provider>
  );
};

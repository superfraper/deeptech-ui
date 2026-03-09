import { useState, useEffect, useRef } from 'react';
import { useApi } from '../../../services/api';
import { useAuth0 } from '@auth0/auth0-react';
import { useFileProcessing } from '../../../context/FileProcessingContext';

export const useFileUploader = () => {
  const api = useApi();
  const { user, isAuthenticated } = useAuth0();
  const { addProcessingFile, removeProcessingFile } = useFileProcessing();
  // files: [{ name, status, error }]
  const [files, setFiles] = useState([]);
  const queueRef = useRef([]); // Kolejka plików do przetworzenia
  const isProcessingRef = useRef(false); // Czy trwa przetwarzanie
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing files when component mounts
  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          const result = await api.getUsersFiles(user);
          console.log('Fetched existing files:', result);
          // Convert to file objects with status 'Ready'
          setFiles(
            (result.files || []).map(name => ({
              name,
              status: 'Ready',
              error: null,
            }))
          );
        } catch (err) {
          console.error('Error fetching existing files:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchExistingFiles();
  }, [isAuthenticated, user, api]);

  const showSuccessMessage = message => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const showErrorMessage = message => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  // Przetwarzaj kolejkę plików jeden po drugim
  const processQueue = async () => {
    if (isProcessingRef.current) return;
    if (queueRef.current.length === 0) return;
    isProcessingRef.current = true;

    const { file, fileName } = queueRef.current[0];

    // Create AbortController for this file
    const abortController = new AbortController();

    // Add to global file processing context
    addProcessingFile(fileName, abortController);

    // Ustaw status na 'Uploading'
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.name === fileName ? { ...f, status: 'Uploading', error: null } : f
      )
    );

    try {
      // Upload and process the file in one step (backend does everything)
      const uploadData = await api.uploadFile(file, abortController);

      // Check if the operation was aborted
      if (abortController.signal.aborted) {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.name === fileName
              ? { ...f, status: 'Error', error: 'Upload cancelled by user' }
              : f
          )
        );
        return;
      }

      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.name === fileName ? { ...f, status: 'Ready', error: null } : f
        )
      );
      showSuccessMessage('File uploaded and processed successfully!');
    } catch (error) {
      console.error('Error uploading or processing file:', error);

      // Check if it was an abort error
      const isAborted =
        error.name === 'AbortError' || error.message.includes('abort');
      const errorMessage = isAborted
        ? 'Upload cancelled by user'
        : error.message;

      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.name === fileName
            ? { ...f, status: 'Error', error: errorMessage }
            : f
        )
      );

      if (!isAborted) {
        showErrorMessage(
          'Error uploading or processing file: ' + error.message
        );
      }
    } finally {
      // Remove from global processing context
      removeProcessingFile(fileName);

      // Usuń z kolejki i przetwarzaj kolejny
      queueRef.current.shift();
      isProcessingRef.current = false;
      if (queueRef.current.length > 0) {
        processQueue();
      }
    }
  };

  // Dodaj plik do kolejki
  const handleFileUpload = (file, fileName) => {
    if (!file) return;
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showErrorMessage('Only PDF files are allowed.');
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showErrorMessage('File size must be less than 10MB.');
      return;
    }
    setFiles(prevFiles => {
      if (prevFiles.some(f => f.name === fileName)) return prevFiles;
      // Nowy plik: status 'W kolejce'
      return [
        ...prevFiles,
        {
          name: fileName,
          status:
            queueRef.current.length === 0 && !isProcessingRef.current
              ? 'Uploading'
              : 'W kolejce',
          error: null,
        },
      ];
    });
    // Dodaj do kolejki
    queueRef.current.push({ file, fileName });
    // Jeśli nie trwa przetwarzanie, zacznij
    if (!isProcessingRef.current) {
      processQueue();
    }
  };

  const handleDrop = event => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    Array.from(droppedFiles).forEach(file => {
      if (!files.some(f => f.name === file.name)) {
        handleFileUpload(file, file.name);
      }
    });
  };

  const handleDragOver = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleFileSelect = event => {
    const selectedFiles = event.target.files;
    Array.from(selectedFiles).forEach(file => {
      if (!files.some(f => f.name === file.name)) {
        handleFileUpload(file, file.name);
      }
    });
    event.target.value = '';
  };

  const removeFile = async fileName => {
    try {
      await api.deleteFile(fileName);
      setFiles(prevFiles => prevFiles.filter(f => f.name !== fileName));
      showSuccessMessage('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      showErrorMessage('Error deleting file: ' + error.message);
    }
  };

  // Function to abort file processing
  const abortFile = async fileName => {
    try {
      // Call backend abort endpoint
      await api.abortFileUpload(fileName);
      console.log(`Backend abort request sent for ${fileName}`);
    } catch (error) {
      console.error('Error sending abort request to backend:', error);
    }
  };

  // Efekt: aktualizuj statusy plików w kolejce na 'Queued', tylko pierwszy ma 'Uploading' lub 'Processing'
  useEffect(() => {
    setFiles(prevFiles => {
      let foundProcessing = false;
      return prevFiles.map((f, idx) => {
        if (f.status === 'Ready' || f.status === 'Error') return f;
        if (
          !foundProcessing &&
          (f.status === 'Uploading' || f.status === 'Processing')
        ) {
          foundProcessing = true;
          return f;
        }
        if (!foundProcessing && idx === 0) {
          foundProcessing = true;
          return f;
        }
        // Pozostałe pliki w kolejce
        return { ...f, status: 'Queued' };
      });
    });
  }, [JSON.stringify(files)]);

  return {
    files, // [{ name, status, error }]
    successMessage,
    errorMessage,
    isLoading,
    handleDrop,
    handleDragOver,
    handleFileSelect,
    removeFile,
    abortFile,
    showSuccessMessage,
    showErrorMessage,
  };
};

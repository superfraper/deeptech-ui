import React, { useState, useRef, useEffect } from 'react';
import { useApi } from '../../services/api';
import ChatMessage from './ChatMessage';

const ChatWidget = () => {
  const api = useApi();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [contextDocuments, setContextDocuments] = useState([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState([]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableDocuments();
    }
  }, [isOpen]);

  const loadAvailableDocuments = async () => {
    try {
      const response = await api.getUsersFiles();
      if (response?.documents) {
        const uniqueFiles = [...new Set(response.documents.map((doc) => doc.filename || doc.document_id))];
        setAvailableDocuments(uniqueFiles);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: userMessage.content,
        session_id: sessionId,
        context_documents: contextDocuments.length > 0 ? contextDocuments : null,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSessionId(response.session_id);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleDocument = (doc) => {
    setContextDocuments((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setContextDocuments([]);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary hover:bg-primary/90'
        }`}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {isOpen ? (
          <svg
            className='w-6 h-6 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        ) : (
          <svg
            className='w-6 h-6 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className='fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden'
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {/* Header */}
          <div className='bg-primary text-white px-4 py-3 flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>Audomate Assistant</h3>
              <p className='text-xs text-white/70'>
                Ask questions about compliance and documents
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowDocumentSelector(!showDocumentSelector)}
                className='p-2 hover:bg-black/10 rounded transition-colors'
                title='Select documents for context'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </button>
              <button
                onClick={clearChat}
                className='p-2 hover:bg-black/10 rounded transition-colors'
                title='Clear chat'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Document Selector */}
          {showDocumentSelector && (
            <div className='bg-gray-50 border-b border-gray-200 p-3 max-h-40 overflow-y-auto'>
              <p className='text-xs text-gray-600 mb-2'>
                Select documents for context:
              </p>
              {availableDocuments.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {availableDocuments.map((doc) => (
                    <button
                      key={doc}
                      onClick={() => toggleDocument(doc)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        contextDocuments.includes(doc)
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {doc.length > 20 ? doc.substring(0, 20) + '...' : doc}
                    </button>
                  ))}
                </div>
              ) : (
                <p className='text-xs text-gray-500'>No documents uploaded</p>
              )}
            </div>
          )}

          {/* Context Documents Indicator */}
          {contextDocuments.length > 0 && !showDocumentSelector && (
            <div className='bg-blue-50 border-b border-blue-100 px-3 py-2'>
              <p className='text-xs text-blue-600'>
                Using {contextDocuments.length} document(s) for context
              </p>
            </div>
          )}

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.length === 0 ? (
              <div className='text-center text-gray-500 mt-8'>
                <p className='text-sm mb-4'>
                  Hi! I&apos;m your Audomate assistant.
                </p>
                <p className='text-xs'>
                  Ask me questions about DORA compliance, contracts, or your
                  uploaded documents.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))
            )}
            {isLoading && (
              <div className='flex items-center gap-2 text-gray-500'>
                <div className='animate-pulse flex space-x-1'>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100'></div>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200'></div>
                </div>
                <span className='text-xs'>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className='border-t border-gray-200 p-3'>
            <div className='flex items-end gap-2'>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Type your message...'
                className='flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-24'
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className='bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

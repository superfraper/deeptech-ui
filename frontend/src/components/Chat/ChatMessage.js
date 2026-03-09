import React, { useState } from 'react';

const ChatMessage = ({ message }) => {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : message.isError
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-800'
        }`}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <p className='text-sm whitespace-pre-wrap'>{message.content}</p>

        {message.sources && message.sources.length > 0 && (
          <div className='mt-2'>
            <button
              onClick={() => setShowSources(!showSources)}
              className='text-xs underline opacity-75 hover:opacity-100 transition-opacity'
            >
              {showSources ? 'Hide sources' : `Show ${message.sources.length} source(s)`}
            </button>

            {showSources && (
              <div className='mt-2 pt-2 border-t border-gray-300 space-y-1'>
                {message.sources.map((source, index) => (
                  <div
                    key={index}
                    className='text-xs bg-white/20 rounded px-2 py-1'
                  >
                    <span className='font-medium'>Source {index + 1}:</span>{' '}
                    {source.id || source.document || 'Document'}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className='text-xs opacity-60 mt-1'>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

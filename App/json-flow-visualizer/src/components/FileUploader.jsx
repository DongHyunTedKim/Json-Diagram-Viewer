import React, { useState, useCallback } from 'react';

const FileUploader = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = [...e.dataTransfer.files];
    processFiles(files);
  }, []);

  const handleFileSelect = (e) => {
    const files = [...e.target.files];
    processFiles(files);
  };

  const processFiles = (files) => {
    const imageFiles = [];
    const jsonFiles = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      } else if (file.type === 'application/json') {
        jsonFiles.push(file);
      }
    });

    onFilesSelected(imageFiles, jsonFiles);
  };

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        position: 'absolute',
        top: '100px',
        right: '100px',
        width: '300px',
        border: `2px dashed ${isDragging ? '#0066cc' : '#ccc'}`,
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#f0f8ff' : '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}
    >
      <input
        type="file"
        multiple
        accept=".jpg,.json"
        onChange={handleFileSelect}
        style={{ marginBottom: '10px' }}
      />
      <p style={{ margin: '10px 0', color: '#666' }}>
        또는 파일을 여기에 드래그하세요
      </p>
    </div>
  );
};

export default FileUploader; 
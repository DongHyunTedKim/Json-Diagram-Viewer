// 사용 안 함

import React, { useState, useCallback } from 'react';

const FileUploader = ({ onFilesSelected }) => {
  // 드래그 상태 관리
  const [isDragging, setIsDragging] = useState(false);

  // 드래그 이벤트 핸들러들
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

  // 파일 드롭 처리
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // FolderViewer에서 드래그된 파일 처리
    const draggedFileData = e.dataTransfer.getData('application/json');
    if (draggedFileData) {
      try {
        const fileData = JSON.parse(draggedFileData);
        // 파일 경로로부터 실제 파일 가져오기
        const response = await fetch(fileData.path);
        const blob = await response.blob();
        const file = new File([blob], fileData.name, { type: 'image/jpeg' });
        
        processFiles([file]);
        return;
      } catch (err) {
        console.error('드래그된 파일 처리 중 에러:', err);
      }
    }
    
    // 일반적인 파일 드롭 처리
    const files = [...e.dataTransfer.files];
    processFiles(files);
  }, []);

  // 파일 선택 처리
  const handleFileSelect = (e) => {
    const files = [...e.target.files];
    processFiles(files);
  };

  // 파일 처리 로직
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
        top: '60px',
        right: '20px',
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
        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff,.json"
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
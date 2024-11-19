import React, { useState, useEffect } from 'react';

const FolderViewer = ({ onImageSelect, onFilesSelected }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);

  useEffect(() => {
    try {
      const images = import.meta.glob('/public/data/images/*.(jpg|jpeg|png|gif|webp|bmp|tiff)');
      
      const imageList = Object.keys(images).map(path => ({
        name: path.split('/').pop(),
        path: path.replace('/public', ''),
        type: 'image'
      }));
      
      setFiles(imageList);
    } catch (err) {
      setError('이미지 폴더를 불러오는데 실패했습니다.');
      console.error('이미지 로딩 에러:', err);
    }
  }, []);

  const handleClick = async (file) => {
    setSelectedFileName(file.name);
    
    onImageSelect({
      path: file.path,
      name: file.name,
      type: 'image/jpeg'
    });

    const jsonName = file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/, '.json');
    const jsonPath = `/data/jsons/${jsonName}`;
    
    try {
      const response = await fetch(jsonPath);
      if (response.ok) {
        const jsonData = await response.json();
        onFilesSelected([], [new File([JSON.stringify(jsonData)], jsonName, { type: 'application/json' })]);
      }
    } catch (err) {
      console.error('JSON 파일 로딩 에러:', err);
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: '190px',
        right: '20px',
        width: '150px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #eee',
        zIndex: 1000
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>@images 폴더</h3>
      {error ? (
        <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>
      ) : (
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #eee',
          borderRadius: '4px'
        }}>
          {files.map((file, index) => (
            <div
              key={index}
              onClick={() => handleClick(file)}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                backgroundColor: selectedFileName === file.name ? '#e6f3ff' : 'transparent',
                borderLeft: selectedFileName === file.name ? '3px solid #0066cc' : '3px solid transparent'
              }}
            >
              <span style={{ fontSize: '12px' }}>🖼️</span>
              <span style={{ fontSize: '13px' }}>{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderViewer; 
import React, { useState, useEffect } from 'react';

const FolderViewer = ({ onImageSelect, onFilesSelected, fitView }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [currentPath, setCurrentPath] = useState('/public/data/images');
  const [selectedFolderPath, setSelectedFolderPath] = useState(null);
  const [selectedImagePath, setSelectedImagePath] = useState(null);
  const [selectedJsonPath, setSelectedJsonPath] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    loadImagesFromPath(currentPath);
  }, [currentPath]);

  const loadImagesFromPath = async (path) => {
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
  };

  const handleFolderSelect = async () => {
    try {
      // File System Access API 지원 여부 확인
      if (!window.showDirectoryPicker) {
        // 대체 방법: input file을 사용
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.webkitdirectory = true;
        input.directory = true;
        
        input.onchange = async (e) => {
          const files = Array.from(e.target.files);
          const imageFiles = [];
          const jsonFiles = new Map();
          
          // JSON 파일 먼저 처리
          files.forEach(file => {
            if (file.name.endsWith('.json')) {
              jsonFiles.set(file.name, file);
            }
          });
          
          // 이미지 파일 처리
          files.forEach(file => {
            if (file.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i)) {
              const jsonName = file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/, '.json');
              const jsonFile = jsonFiles.get(jsonName);
              
              imageFiles.push({
                name: file.name,
                path: URL.createObjectURL(file),
                type: 'image',
                jsonFile: jsonFile || null
              });
            }
          });
          
          setFiles(imageFiles);
          setSelectedFolderPath(files[0]?.webkitRelativePath.split('/')[0] || 'Selected Folder');
          setError(null);
        };
        
        input.click();
      } else {
        // 기존 showDirectoryPicker 코드 유지
        const dirHandle = await window.showDirectoryPicker();
        const files = [];
        const jsonFiles = new Map(); // JSON 파일을 저장할 Map 객체

        // 먼저 모든 파일을 스캔하여 JSON 파일을 Map에 저장
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            if (entry.name.endsWith('.json')) {
              const jsonFile = await entry.getFile();
              jsonFiles.set(entry.name, jsonFile);
            }
          }
        }

        // 이미지 파일을 처리하고 관련 JSON 파일이 있는지 확인
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && entry.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i)) {
            const file = await entry.getFile();
            const jsonName = file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/, '.json');
            const jsonFile = jsonFiles.get(jsonName);

            files.push({
              name: file.name,
              path: URL.createObjectURL(file),
              type: 'image',
              jsonFile: jsonFile || null
            });
          }
        }
        
        setFiles(files);
        setError(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('폴더 선택에 실패했습니다.');
        console.error('폴더 선택 에러:', err);
      }
    }
  };

  const handleClick = async (file) => {
    setSelectedFileName(file.name);
    setSelectedImagePath(file.path);
    
    if (file.jsonFile) {
      setSelectedJsonPath(file.jsonFile.name);
    } else {
      setSelectedJsonPath(`/data/jsons/${file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/, '.json')}`);
    }
    
    onImageSelect({
      path: file.path,
      name: file.name,
      type: 'image/jpeg'
    });

    if (file.jsonFile) {
      try {
        const jsonText = await file.jsonFile.text();
        const jsonData = JSON.parse(jsonText);
        onFilesSelected([], [new File([JSON.stringify(jsonData)], file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/, '.json'), { type: 'application/json' })]);
        setTimeout(() => {
          fitView();
        }, 100);
      } catch (err) {
        console.error('JSON 파일 로딩 에러:', err);
      }
    } else {
      // 기존 서버 경로에서 JSON 파일을 가져오는 로직 유지
      const jsonName = file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/, '.json');
      const jsonPath = `/data/jsons/${jsonName}`;
      
      try {
        const response = await fetch(jsonPath);
        if (response.ok) {
          const jsonData = await response.json();
          onFilesSelected([], [new File([JSON.stringify(jsonData)], jsonName, { type: 'application/json' })]);
          setTimeout(() => {
            fitView();
          }, 100);
        }
      } catch (err) {
        console.error('JSON 파일 로딩 에러:', err);
      }
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: '60px',
        right: isMinimized ? '-270px' : '0px',
        width: '200px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #eee',
        zIndex: 1000,
        transition: 'right 0.3s ease-in-out'
      }}
    >
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        style={{
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '60px',
          backgroundColor: '#fff',
          border: '1px solid #eee',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}
      >
        {isMinimized ? '<' : '>'}
      </button>

      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>@images 폴더</h3>
        <button
          onClick={handleFolderSelect}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          폴더 선택
        </button>

        <div style={{
          fontSize: '11px',
          backgroundColor: '#f5f5f5',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #eee'
        }}>
          <div style={{ marginBottom: '6px' }}>
            <strong>폴더:</strong> {selectedFolderPath || 'None'}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong>이미지:</strong> {selectedImagePath || 'None'}
          </div>
          <div>
            <strong>JSON:</strong> {selectedJsonPath || 'None'}
          </div>
        </div>
      </div>
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
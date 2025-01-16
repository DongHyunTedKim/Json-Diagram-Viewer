import React, { useState } from 'react';
import { FLOW_CONSTANTS } from '../constants/flowConstants';
import { Position } from 'reactflow';

const ToolboxViewer = ({ onLayoutDirectionChange, fitView, backgroundImageOpacity, setBackgroundImageOpacity }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState('TD'); // 기본값: Top to Down

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleLayoutDirection = () => {
    const newDirection = layoutDirection === 'TD' ? 'LR' : 'TD';
    setLayoutDirection(newDirection);
    onLayoutDirectionChange(newDirection);
    setTimeout(() => {
      fitView();
    }, 50);
  };

  const nodeTemplates = [
    {
      type: 'custom',
      label: '노드',
      description: '드래그하여 새 노드를 추가하세요',
      icon: '📦',
    }
  ];

  return (
    <div 
      style={{
        position: 'absolute',
        top: '560px',
        right: isMinimized ? '-270px' : '0px',
        width: '250px',
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
        gap: '10px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>🛠️ Tool Box</h3>
          <button
            onClick={toggleLayoutDirection}
            style={{
              padding: '4px 8px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {layoutDirection === 'TD' ? '↓' : '→'} 
            {layoutDirection === 'TD' ? '상하 배치' : '좌우 배치'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {nodeTemplates.map((template, index) => (
            <div
              key={index}
              draggable
              onDragStart={(event) => onDragStart(event, template.type)}
              style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #eee',
                borderRadius: '4px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#e9ecef',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{template.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {template.label}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {template.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #eee'
        }}>
          <div style={{
            fontSize: '12px',
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>배경 이미지 투명도</span>
            <span>{Math.round(backgroundImageOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={backgroundImageOpacity}
            onChange={(e) => setBackgroundImageOpacity(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#666'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolboxViewer; 
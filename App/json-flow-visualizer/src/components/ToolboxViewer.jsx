import React, { useState } from 'react';
import { FLOW_CONSTANTS } from '../constants/flowConstants';
import { Position } from 'reactflow';

const ToolboxViewer = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTemplates = [
    {
      type: 'custom',
      label: '노드',
      description: '기본적인 노드 템플릿',
      icon: '📦',
      data: {
        label: '새 노드',
        handles: [
          { type: 'source', position: Position.Top, id: 'a' },
          { type: 'source', position: Position.Right, id: 'b' },
          { type: 'source', position: Position.Bottom, id: 'c' },
          { type: 'source', position: Position.Left, id: 'd' }
        ]
      }
    }
  ];

  return (
    <div 
      style={{
        position: 'absolute',
        top: '120px',
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
        <h3 style={{ margin: 0, fontSize: '14px' }}>🛠️ 노드 템플릿</h3>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
          드래그하여 새 노드를 추가하세요
        </p>

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
      </div>
    </div>
  );
};

export default ToolboxViewer; 
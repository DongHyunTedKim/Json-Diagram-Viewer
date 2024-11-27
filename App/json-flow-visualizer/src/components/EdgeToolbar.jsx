import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { MarkerType } from 'reactflow';

const EdgeToolbar = ({ edge, setEdges, position }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateEdgeStyle = (key, value) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === edge.id) {
          return {
            ...e,
            style: {
              ...e.style,
              [key]: value
            }
          };
        }
        return e;
      })
    );
  };

  const getCurrentLineType = () => {
    const dashArray = edge.style?.strokeDasharray;
    if (dashArray === '5,5') return 'dashed';
    if (dashArray === '2,2') return 'dotted';
    return 'solid';
  };

  const getCurrentThickness = () => {
    return edge.style?.strokeWidth || '2';
  };

  const lineTypes = [
    { label: '실선', value: 'solid' },
    { label: '점선', value: 'dashed' },
    { label: '점들', value: 'dotted' }
  ];

  const thicknessTypes = [
    { label: '얇게', value: '1' },
    { label: '보통', value: '2' },
    { label: '두껍게', value: '3' }
  ];

  return (
    <div className="edge-toolbar" onClick={(e) => e.stopPropagation()}>
      {/* 선 타입 선택 */}
      <select
        value={getCurrentLineType()}
        onChange={(e) => updateEdgeStyle('strokeDasharray', 
          e.target.value === 'dashed' ? '5,5' : 
          e.target.value === 'dotted' ? '2,2' : 
          'none'
        )}
        className="edge-toolbar-select"
      >
        {lineTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {/* 선 두께 선택 */}
      <select
        value={getCurrentThickness()}
        onChange={(e) => updateEdgeStyle('strokeWidth', e.target.value)}
        className="edge-toolbar-select"
      >
        {thicknessTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {/* 색상 선택 버튼 */}
      <div className="color-picker-container">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="color-picker-button"
          style={{ backgroundColor: edge.style?.stroke || '#000' }}
        />
        {showColorPicker && (
          <div className="color-picker-popup">
            <HexColorPicker
              color={edge.style?.stroke || '#000'}
              onChange={(color) => updateEdgeStyle('stroke', color)}
            />
          </div>
        )}
      </div>

      {/* 방향 토글 */}
      <button
        onClick={() => {
          setEdges((eds) =>
            eds.map((e) => {
              if (e.id === edge.id) {
                return {
                  ...e,
                  markerEnd: e.markerEnd?.type === 'arrowclosed' ? {
                    type: MarkerType.Arrow,
                    width: 0,
                    height: 0,
                    color: 'transparent'
                  } : {
                    type: 'arrowclosed',
                    width: 10,
                    height: 10,
                    color: e.style?.stroke || '#000'
                  }
                };
              }
              return e;
            })
          );
          console.log(edge.markerEnd)
        }}
        className="edge-toolbar-button"
      >
        방향
      </button>
    </div>
  );
};

export default EdgeToolbar;
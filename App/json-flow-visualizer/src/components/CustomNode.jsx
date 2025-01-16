import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = memo(({ id, data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data.label);
  const inputRef = useRef(null);

  useEffect(() => {
    setLabelText(data.label);
  }, [data.label]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (labelText !== data.label) {
      data.onNodeLabelChange(id, labelText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div onDoubleClick={handleDoubleClick} className="custom-node">
      {isEditing ? (
        <input
          ref={inputRef}
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            outline: 'none',
            fontSize: '12px'
          }}
        />
      ) : (
        <div>{labelText}</div>
      )}
      <Handle type="source" position={Position.Top} id="a" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="c" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Left} id="d" isConnectable={isConnectable} />
    </div>
  );
});

export default CustomNode;
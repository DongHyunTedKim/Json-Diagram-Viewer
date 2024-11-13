import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      <div className="custom-node-content">
        {data.label}
      </div>
      <Handle type="source" position={Position.Top} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
      <Handle type="source" position={Position.Bottom} id="c" />
      <Handle type="source" position={Position.Left} id="d" />
    </div>
  );
});

export default CustomNode;
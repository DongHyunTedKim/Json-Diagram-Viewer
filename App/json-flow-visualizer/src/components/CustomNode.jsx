import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = memo(({ data, isConnectable }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} id="t" className="react-flow__handle-top" isConnectable={isConnectable} />
      <Handle type="target" position={Position.Right} id="r" className="react-flow__handle-right" isConnectable={isConnectable} />
      <Handle type="target" position={Position.Bottom} id="b" className="react-flow__handle-bottom" isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} id="l" className="react-flow__handle-left" isConnectable={isConnectable} />
      
      <div className="custom-node-content">
        {data.label}
      </div>
      <Handle type="source" position={Position.Top} id="t" className="react-flow__handle-top" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="r" className="react-flow__handle-right" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="b" className="react-flow__handle-bottom" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Left} id="l" className="react-flow__handle-left" isConnectable={isConnectable} />
    </div>
  );
});

export default CustomNode;
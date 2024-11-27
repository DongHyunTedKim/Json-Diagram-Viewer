import { useCallback, useState, useRef, useEffect } from 'react';
import { useStore, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { getEdgeParams } from '../utils/utils_simple';
import EdgeToolbar from './EdgeToolbar';

function SimpleFloatingEdge({ id, source, target, markerEnd, style, selected, label, data, setEdges }) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(label || '');
  const inputRef = useRef(null);
  
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  useEffect(() => {
    setLabelText(label || '');
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (labelText !== label) {
      setEdges(edges => 
        edges.map(edge => {
          if (edge.id === id) {
            return { ...edge, label: labelText };
          }
          return edge;
        })
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.target.blur();
    }
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path floating"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 40}px)`,
            pointerEvents: 'all',
            zIndex: 1001
          }}
        >
          {selected && (
            <EdgeToolbar
              edge={{ 
                id, 
                source, 
                target, 
                markerEnd, 
                style,
                direction: markerEnd?.width === 10 && markerEnd?.type === 'arrowclosed'
              }}
              setEdges={setEdges}
              position={{ x: labelX, y: labelY }}
            />
          )}
        </div>
      </EdgeLabelRenderer>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="react-flow__edge-label nodrag nopan"
          onDoubleClick={onDoubleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="edge-label-input"
              style={{
                width: '100%',
                border: 'none',
                background: 'white',
                textAlign: 'center',
                outline: 'none',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
              }}
            />
          ) : (
            labelText || ''
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default SimpleFloatingEdge;
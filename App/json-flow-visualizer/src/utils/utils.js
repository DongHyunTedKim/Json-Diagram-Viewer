import { Position, MarkerType } from 'reactflow';

function getNodeIntersection(node, targetNode) {
  const width = node.style?.width || node.width || DEFAULT_NODE_SIZE.width;
  const height = node.style?.height || node.height || DEFAULT_NODE_SIZE.height;
  
  const sourcePosition = node.positionAbsolute || node.position;
  const targetPosition = targetNode.positionAbsolute || targetNode.position;
  
  const sourceCenter = {
    x: sourcePosition.x + width / 2,
    y: sourcePosition.y + height / 2
  };

  const targetWidth = targetNode.style?.width || targetNode.width || DEFAULT_NODE_SIZE.width;
  const targetHeight = targetNode.style?.height || targetNode.height || DEFAULT_NODE_SIZE.height;
  
  const targetCenter = {
    x: targetPosition.x + targetWidth / 2,
    y: targetPosition.y + targetHeight / 2
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const angle = Math.atan2(dy, dx);

  const nodeBox = {
    width: width / 2,
    height: height / 2
  };

  return {
    x: sourceCenter.x + Math.cos(angle) * nodeBox.width,
    y: sourceCenter.y + Math.sin(angle) * nodeBox.height
  };
}

function getEdgePosition(node, intersectionPoint) {
  const position = node.positionAbsolute || node.position;
  const width = node.style?.width || node.width || DEFAULT_NODE_SIZE.width;
  const height = node.style?.height || node.height || DEFAULT_NODE_SIZE.height;
  
  const centerX = position.x + width / 2;
  const centerY = position.y + height / 2;
  
  const dx = Math.abs(intersectionPoint.x - centerX);
  const dy = Math.abs(intersectionPoint.y - centerY);
  
  if (dx > dy) {
    return intersectionPoint.x > centerX ? Position.Right : Position.Left;
  }
  
  return intersectionPoint.y > centerY ? Position.Bottom : Position.Top;
}

export function getEdgeParams(source, target) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
      markerEnd: {
        //type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}

function calculateEdgePosition(sourceNode, targetNode) {
    const sourceCenter = {
        x: sourceNode.position.x + sourceNode.width / 2,
        y: sourceNode.position.y + sourceNode.height / 2
    };
    
    const targetCenter = {
        x: targetNode.position.x + targetNode.width / 2,
        y: targetNode.position.y + targetNode.height / 2
    };

    // 노드 간의 각도 계산
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    const angle = Math.atan2(dy, dx);

    // 각도에 따른 위치 결정
    let sourcePos, targetPos;

    if (Math.abs(angle) < Math.PI / 4) { // 오른쪽
        sourcePos = Position.Right;
        targetPos = Position.Left;
    } else if (Math.abs(angle) > (3 * Math.PI) / 4) { // 왼쪽
        sourcePos = Position.Left;
        targetPos = Position.Right;
    } else if (angle > 0) { // 아래
        sourcePos = Position.Bottom;
        targetPos = Position.Top;
    } else { // 위
        sourcePos = Position.Top;
        targetPos = Position.Bottom;
    }

    return { sourcePos, targetPos };
}
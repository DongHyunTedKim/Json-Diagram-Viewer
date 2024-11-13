import { Position } from 'reactflow';

function getParams(node, target) {
  const centerX = node.positionAbsolute.x + node.width / 2;
  const centerY = node.positionAbsolute.y + node.height / 2;

  const targetCenterX = target.positionAbsolute.x + target.width / 2;
  const targetCenterY = target.positionAbsolute.y + target.height / 2;

  const position = getPosition(node, target);
  const offset = 15;

  if (position === Position.Left) return [node.positionAbsolute.x - offset, centerY, position];
  if (position === Position.Right) return [node.positionAbsolute.x + node.width + offset, centerY, position];
  if (position === Position.Top) return [centerX, node.positionAbsolute.y - offset, position];
  if (position === Position.Bottom) return [centerX, node.positionAbsolute.y + node.height + offset, position];

  return [centerX, centerY, position];
}

function getPosition(node, target) {
  const sourceX = node.positionAbsolute.x + node.width / 2;
  const sourceY = node.positionAbsolute.y + node.height / 2;
  const targetX = target.positionAbsolute.x + target.width / 2;
  const targetY = target.positionAbsolute.y + target.height / 2;
  
  const deltaX = Math.abs(targetX - sourceX);
  const deltaY = Math.abs(targetY - sourceY);

  if (deltaX > deltaY) {
    return targetX > sourceX ? Position.Right : Position.Left;
  }

  return targetY > sourceY ? Position.Bottom : Position.Top;
}

export function getEdgeParams(source, target) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}
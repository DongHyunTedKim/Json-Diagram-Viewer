import { Position } from 'reactflow';

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA, nodeB) {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    const horizontalDiff = Math.abs(centerA.x - centerB.x);
    const verticalDiff = Math.abs(centerA.y - centerB.y);

    let position;

    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    if (horizontalDiff > verticalDiff) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const [x, y] = getHandleCoordsByPosition(nodeA, position);
    return [x, y, position];
}


function getNodeCenter(node) {
    const position = node.positionAbsolute || node.position;
    const width = node.width || 150;
    const height = node.height || 40;

    return {
        x: position.x + width / 2,
        y: position.y + height / 2,
    };
}

function getEdgePosition(sourceNode, targetNode) {
    const sourceCenter = getNodeCenter(sourceNode);
    const targetCenter = getNodeCenter(targetNode);

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    const angle = Math.atan2(dy, dx);

    if (angle <= -7 * Math.PI / 8 || angle > 7 * Math.PI / 8) {
        return { sourcePos: Position.Left, targetPos: Position.Right };
    } else if (angle <= -5 * Math.PI / 8) {
        return { sourcePos: Position.Top, targetPos: Position.Right };
    } else if (angle <= -3 * Math.PI / 8) {
        return { sourcePos: Position.Top, targetPos: Position.Bottom };
    } else if (angle <= -Math.PI / 8) {
        return { sourcePos: Position.Right, targetPos: Position.Bottom };
    } else if (angle <= Math.PI / 8) {
        return { sourcePos: Position.Right, targetPos: Position.Left };
    } else if (angle <= 3 * Math.PI / 8) {
        return { sourcePos: Position.Right, targetPos: Position.Top };
    } else if (angle <= 5 * Math.PI / 8) {
        return { sourcePos: Position.Bottom, targetPos: Position.Top };
    } else if (angle <= 7 * Math.PI / 8) {
        return { sourcePos: Position.Left, targetPos: Position.Top };
    } else {
        return { sourcePos: Position.Left, targetPos: Position.Right };
    }
}

function getHandleCoords(node, position) {
    const width = node.width || 150;
    const height = node.height || 40;
    const nodePosition = node.positionAbsolute || node.position;
    const offset = 15;

    switch (position) {
        case Position.Top:
            return {
                x: nodePosition.x + width / 2,
                y: nodePosition.y - offset
            };
        case Position.Right:
            return {
                x: nodePosition.x + width + offset,
                y: nodePosition.y + height / 2
            };
        case Position.Bottom:
            return {
                x: nodePosition.x + width / 2,
                y: nodePosition.y + height + offset
            };
        case Position.Left:
            return {
                x: nodePosition.x - offset,
                y: nodePosition.y + height / 2
            };
        default:
            return {
                x: nodePosition.x + width / 2,
                y: nodePosition.y + height / 2
            };
    }
}

export function getEdgeParams(source, target) {
    const { sourcePos, targetPos } = getEdgePosition(source, target);
    const sourceHandle = getHandleCoords(source, sourcePos);
    const targetHandle = getHandleCoords(target, targetPos);

    return {
        sx: sourceHandle.x,
        sy: sourceHandle.y,
        tx: targetHandle.x,
        ty: targetHandle.y,
        sourcePos,
        targetPos,
    };
}
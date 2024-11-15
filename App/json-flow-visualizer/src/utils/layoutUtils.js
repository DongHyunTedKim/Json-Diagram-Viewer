// src/utils/layoutUtils.js
import dagre from 'dagre';
import { FLOW_CONSTANTS } from '../constants/flowConstants';

function getNodeDimensions(node) {
    return {
        width: node.style?.width || FLOW_CONSTANTS.NODE.SIZE.DEFAULT_WIDTH,
        height: node.style?.height || FLOW_CONSTANTS.NODE.SIZE.DEFAULT_HEIGHT
    };
}

export function applyLayout(nodes, edges, direction = 'LR') {
    const dagreGraph = new dagre.graphlib.Graph();
    
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: FLOW_CONSTANTS.NODE.LAYOUT.RANKSEP,    
        nodesep: FLOW_CONSTANTS.NODE.LAYOUT.NODESEP,     
        marginx: FLOW_CONSTANTS.NODE.LAYOUT.MARGIN.X,
        marginy: FLOW_CONSTANTS.NODE.LAYOUT.MARGIN.Y,
        align: 'UL',
    });

    // 각 노드의 실제 크기 사용
    nodes.forEach(node => {
        const dimensions = getNodeDimensions(node);
        dagreGraph.setNode(node.id, {
            width: dimensions.width,
            height: dimensions.height,
            label: node.data.label
        });
    });

    // 엣지 설정 업데이트
    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target, {
            weight: 1,  // 모든 엣지의 가중치를 동일하게
            minlen: 1,  // 최소 길이도 동일하게
            labelpos: 'c',
            labeloffset: 0,
            curve: 'basis'  // 곡선 타입
        });
    });

    // 레이아웃 실행
    dagre.layout(dagreGraph);

    // 노드 위치 업데이트
    return nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
        
        if (!nodeWithPosition) {
            return node;
        }

        // 부모 노드 찾기
        const parentNode = nodes.find(n => n.id === node.parentId);
        
        if (parentNode) {
            // 자식 노드인 경우
            const siblingNodes = nodes.filter(n => n.parentId === node.parentId);
            const nodeIndex = siblingNodes.findIndex(n => n.id === node.id);
            const totalSiblings = siblingNodes.length;
            
            // 부모 노드의 좌측 여백 계산
            const parentLeftMargin = FLOW_CONSTANTS.NODE.PADDING.HORIZONTAL;
            
            // 자식 노드들 사이의 총 간격
            const totalSpacing = (totalSiblings - 1) * FLOW_CONSTANTS.NODE.CHILD_SPACING;
            
            // 자식 노드들의 총 너비
            const totalChildrenWidth = siblingNodes.reduce((sum, sibling) => {
                const siblingDimensions = getNodeDimensions(sibling);
                return sum + siblingDimensions.width;
            }, 0);
            
            // 각 자식 노드의 x 위치 계산
            let accumulatedX = parentLeftMargin;
            for (let i = 0; i < nodeIndex; i++) {
                const prevSibling = siblingNodes[i];
                const prevDimensions = getNodeDimensions(prevSibling);
                accumulatedX += prevDimensions.width + FLOW_CONSTANTS.NODE.CHILD_SPACING;
            }
            
            // 수직 위치 계산 (부모 노드의 상단 여백 + 수직 패딩)
            const verticalPosition = FLOW_CONSTANTS.NODE.PADDING.VERTICAL;
            
            return {
                ...node,
                position: {
                    x: parentNode.position.x + accumulatedX,
                    y: parentNode.position.y + verticalPosition
                }
            };
        } else {
            // 최상위 노드인 경우
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x,
                    y: nodeWithPosition.y
                }
            };
        }
    });
}
// src/utils/layoutUtils.js
import dagre from 'dagre';

// 기본 노드 크기 설정
const DEFAULT_NODE_SIZE = {
    width: 150,    // 모든 노드의 기본 너비
    height: 40,    // 모든 노드의 기본 높이
};

// 기본 간격 설정
const DEFAULT_SPACING = {
    rankdir: 'LR',
    ranksep: 0,    // 좌우 간격 증가
    nodesep: 0,     // 상하 간격 증가
    marginx: 0,     // 여백 증가
    marginy: 0,
};

function getNodeDimensions(node) {
    return {
        width: node.style?.width || DEFAULT_NODE_SIZE.width,
        height: node.style?.height || DEFAULT_NODE_SIZE.height
    };
}

export function applyLayout(nodes, edges, direction = 'LR') {
    const dagreGraph = new dagre.graphlib.Graph();
    
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 100,    // 간격 증가
        nodesep: 50,     // 간격 증가
        marginx: 30,
        marginy: 30,
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
            curve: 'basis'  // 곡선 타입 유지
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

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - DEFAULT_NODE_SIZE.width / 2,
                y: nodeWithPosition.y - DEFAULT_NODE_SIZE.height / 2
            }
        };
    });
}
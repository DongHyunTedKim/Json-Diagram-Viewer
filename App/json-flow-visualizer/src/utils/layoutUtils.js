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
    ranksep: 70,       // 좌우 간격 증가
    nodesep: 30,       // 상하 간격
    marginx: 20,       // 좌우 여백
    marginy: 20,       // 상하 여백
};

export function applyLayout(nodes, edges, direction = 'LR') {
    const dagreGraph = new dagre.graphlib.Graph();
    
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction, // 외부에서 direction을 받을 수 있도록 수정
        ranksep: DEFAULT_SPACING.ranksep,
        nodesep: DEFAULT_SPACING.nodesep,
        marginx: DEFAULT_SPACING.marginx,
        marginy: DEFAULT_SPACING.marginy,
        align: 'UL',
    });

    // 모든 노드를 동일한 크기로 설정
    nodes.forEach(node => {
        dagreGraph.setNode(node.id, {
            width: DEFAULT_NODE_SIZE.width,
            height: DEFAULT_NODE_SIZE.height,
            label: node.data.label
        });
    });

    // 엣지 설정 업데이트
    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target, {
            ...edge.data, // edge.data에서 설정 가져오기
            weight: edge.data?.weight || 1,
            minlen: edge.data?.minlen || 1,
            labelpos: edge.data?.labelpos || 'c',
            labeloffset: edge.data?.labeloffset || 5,
            curve: edge.data?.curve || 'basis'
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
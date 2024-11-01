// src/utils/layoutUtils.js
import dagre from 'dagre';

// 기본 노드 크기 설정
const DEFAULT_NODE_SIZE = {
    width: 150,    // 모든 노드의 기본 너비
    height: 40,    // 모든 노드의 기본 높이
};

// 기본 간격 설정
const DEFAULT_SPACING = {
    rankdir: 'TB',     // 위에서 아래로 방향
    ranksep: 50,       // 수직 간격
    nodesep: 30,       // 수평 간격
    marginx: 20,       // 좌우 여백
    marginy: 20,       // 상하 여백
};

export function applyLayout(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
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

    // 엣지 설정
    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target, {
            weight: 1,
            minlen: 1,
            labelpos: 'c',
            labeloffset: 5,
            curve: 'basis'
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
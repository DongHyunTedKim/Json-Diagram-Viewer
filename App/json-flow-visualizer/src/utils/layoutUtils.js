// src/utils/layoutUtils.js
import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 36;
const groupPadding = 50;  // 그룹 노드의 패딩

export function applyLayout(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ 
        rankdir: direction,
        ranksep: 100,  // 계층 간 간격 증가
        nodesep: 60,   // 노드 간 간격 증가
        marginx: 50,   // 가로 여백
        marginy: 50    // 세로 여백
    });

    // 먼저 그룹 노드를 처리
    const groupNodes = nodes.filter(node => node.data.isGroup);
    const childNodes = nodes.filter(node => !node.data.isGroup);

    // 그룹 노드 설정
    groupNodes.forEach(node => {
        const childCount = childNodes.filter(child => child.parentNode === node.id).length;
        const groupHeight = nodeHeight * childCount + groupPadding * 2;
        dagreGraph.setNode(node.id, { 
            width: nodeWidth + groupPadding * 2, 
            height: groupHeight 
        });
    });

    // 일반 노드 설정
    childNodes.forEach(node => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // 엣지 설정
    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // 노드 위치 업데이트
    return nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (node.data.isGroup) {
            // 그룹 노드의 경우 더 큰 영역 할당
            node.style = {
                ...node.style,
                width: nodeWidth + groupPadding * 2,
                height: nodeWithPosition.height
            };
        }
        
        node.position = {
            x: nodeWithPosition.x - (node.data.isGroup ? (nodeWidth + groupPadding * 2) / 2 : nodeWidth / 2),
            y: nodeWithPosition.y - (node.data.isGroup ? nodeWithPosition.height / 2 : nodeHeight / 2)
        };
        
        return node;
    });
}
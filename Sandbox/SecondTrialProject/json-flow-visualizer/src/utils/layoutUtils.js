// src/utils/layoutUtils.js
import dagre from 'dagre';

// 노드 기본 크기 설정
export const DEFAULT_SIZES = {
  nodeWidth: 180,
  nodeHeight: 50,
  groupPadding: {
    horizontal: 100,
    vertical: 80
  }
};

// 크기 조절 함수
export function updateNodeSize(width, height) {
  DEFAULT_SIZES.nodeWidth = width;
  DEFAULT_SIZES.nodeHeight = height;
}

export function updateGroupPadding(horizontal, vertical) {
  DEFAULT_SIZES.groupPadding.horizontal = horizontal;
  DEFAULT_SIZES.groupPadding.vertical = vertical;
}

export function applyLayout(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // 그래프 기본 설정
    dagreGraph.setGraph({ 
        rankdir: direction,
        ranksep: 1,    // 수직 간격
        nodesep: 8,     // 수평 간격
        marginx: 1,    // 좌우 여백
        marginy: 1,    // 상하 여백
        align: 'UL',     // 왼쪽 상단 정렬
    });

    // 그룹 깊이 계산 함수
    const getGroupDepth = (node) => {
        let depth = 0;
        let currentNode = node;
        while (currentNode.parentNode) {
            depth++;
            currentNode = nodes.find(n => n.id === currentNode.parentNode);
        }
        return depth;
    };

    // 그룹 노드와 일반 노드 분리 및 깊이별 정렬
    const groupNodes = nodes
        .filter(node => node.data.isGroup)
        .sort((a, b) => getGroupDepth(a) - getGroupDepth(b));
    const childNodes = nodes.filter(node => !node.data.isGroup);

    // 그룹 노드 설정
    groupNodes.forEach(node => {
        const children = nodes.filter(child => child.parentNode === node.id);
        const childCount = Math.max(children.length, 1);
        const depth = getGroupDepth(node);
        
        // 그룹 크기 계산 (하위 그룹 고려)
        const groupWidth = Math.max(
            DEFAULT_SIZES.nodeWidth + DEFAULT_SIZES.groupPadding.horizontal * 2,
            children.length * (DEFAULT_SIZES.nodeWidth + DEFAULT_SIZES.groupPadding.horizontal)
        );
        const groupHeight = Math.max(
            DEFAULT_SIZES.nodeHeight + DEFAULT_SIZES.groupPadding.vertical * 2,
            childCount * (DEFAULT_SIZES.nodeHeight + DEFAULT_SIZES.groupPadding.vertical)
        );

        // 그룹 패딩 계산 (깊이에 따라 증가)
        const depthPadding = (depth + 1) * 40;

        dagreGraph.setNode(node.id, { 
            width: groupWidth + depthPadding,
            height: groupHeight + depthPadding,
            paddingLeft: DEFAULT_SIZES.groupPadding.horizontal + depthPadding/2,
            paddingRight: DEFAULT_SIZES.groupPadding.horizontal + depthPadding/2,
            paddingTop: DEFAULT_SIZES.groupPadding.vertical + depthPadding/2,
            paddingBottom: DEFAULT_SIZES.groupPadding.vertical + depthPadding/2
        });
    });

    // 일반 노드 설정
    childNodes.forEach(node => {
        dagreGraph.setNode(node.id, { 
            width: DEFAULT_SIZES.nodeWidth, 
            height: DEFAULT_SIZES.nodeHeight,
            padding: 20
        });
    });

    // 엣지 설정 (곡선 및 여유 공간 추가)
    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target, {
            weight: 1,
            minlen: 2,  // 최소 길이 증가
            labelpos: 'c',
            labeloffset: 10,
            curve: 'basis'  // 부드러운 곡선
        });
    });

    dagre.layout(dagreGraph);

    // 노드 위치 업데이트
    return nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
        
        if (node.data.isGroup) {
            node.style = {
                ...node.style,
                width: nodeWithPosition.width,
                height: nodeWithPosition.height,
                zIndex: -getGroupDepth(node)  // 그룹 깊이에 따른 z-index 설정
            };
        } else {
            node.style = {
                ...node.style,
                zIndex: 1  // 일반 노드는 항상 위에 표시
            };
        }

        // 상대적 위치 계산
        if (node.parentNode) {
            const parentNode = dagreGraph.node(node.parentNode);
            node.position = {
                x: nodeWithPosition.x - parentNode.x - nodeWithPosition.width/2 + parentNode.width/2,
                y: nodeWithPosition.y - parentNode.y - nodeWithPosition.height/2 + parentNode.height/2
            };
        } else {
            node.position = {
                x: nodeWithPosition.x - nodeWithPosition.width/2,
                y: nodeWithPosition.y - nodeWithPosition.height/2
            };
        }
        
        return node;
    });
}
// 데이터 파싱을 위한 유틸리티 함수

import { Position } from "reactflow";
import { MarkerType } from "reactflow";
import { FLOW_CONSTANTS } from '../constants/flowConstants'; // 노드 상수 가져오기  

//MARK: - 노드 파싱
/**
 * JSON_TEMPLATE.json 파일을 파싱하여 초기 노드를 생성하는 함수
 * @param {Object} data - 파싱할 JSON 데이터
 * @returns {Array} 초기 노드 배열
 */

/**
 * 노드의 크기를 계산하는 함수
 * @param {Object} component - 현재 노드 컴포넌트
 * @returns {Object} 계산된 너비와 높이
 */
function calculateNodeSize(component) {
    // 자식 노드가 없는 경우 최소 크기 반환
    if (!component.node || !Array.isArray(component.node) || component.node.length === 0) {
        return {
            width: FLOW_CONSTANTS.NODE.SIZE.MIN_WIDTH,
            height: FLOW_CONSTANTS.NODE.SIZE.MIN_HEIGHT
        };
    }

    // 모든 자식 노드의 크기를 재귀적으로 계산
    const childSizes = component.node.map(child => calculateNodeSize(child));

    // 자식 노드들의 전체 너비와 최대 높이 계산
    const totalChildrenWidth = childSizes.reduce((sum, size) => sum + size.width, 0);
    const maxChildHeight = Math.max(...childSizes.map(size => size.height));

    // 자식 노드 간 간격을 포함한 전체 너비
    const totalSpacing = FLOW_CONSTANTS.NODE.CHILD_SPACING * (childSizes.length - 1);

    // 최종 너비와 높이 계산 (패딩 포함)
    const width = Math.max(
        FLOW_CONSTANTS.NODE.SIZE.MIN_WIDTH,
        totalChildrenWidth + totalSpacing + (FLOW_CONSTANTS.NODE.PADDING.HORIZONTAL * 2)
    );
    const height = Math.max(
        FLOW_CONSTANTS.NODE.SIZE.MIN_HEIGHT,
        maxChildHeight + (FLOW_CONSTANTS.NODE.PADDING.VERTICAL * 2)
    );

    return { width, height };
}

function parseComponents(data, onNodeLabelChange) {
    const componentArray = data.components || data.nodes || [];
    if (!Array.isArray(componentArray)) {
        throw new Error("유효한 components 또는 nodes 배열이 필요합니다.");
    }

    const nodes = [];

    const traverse = (component, parentId = null, depth = 1) => {
        if (!component.id || !component.text) {
            throw new Error("각 구성 요소는 고유한 id와 text를 가져야 합니다.");
        }

        const { width, height } = calculateNodeSize(component);

        const node = {
            id: String(component.id),
            data: {
                label: component.text,
                onNodeLabelChange
            },
            position: { x: 0, y: 0 },
            type: 'custom',
            className: `Layer${depth}`,
            parentId: parentId,
            handles: [
                { type: 'source', position: Position.Top, id: 't' },
                { type: 'source', position: Position.Right, id: 'r' },
                { type: 'source', position: Position.Bottom, id: 'b' },
                { type: 'source', position: Position.Left, id: 'l' }
            ],
            connectable: true,
            style: {
                width,
                height,
                backgroundColor: depth === 1 ? FLOW_CONSTANTS.NODE.STYLE.BACKGROUND_COLORS.LAYER1 :
                    depth === 2 ? FLOW_CONSTANTS.NODE.STYLE.BACKGROUND_COLORS.LAYER2 :
                        FLOW_CONSTANTS.NODE.STYLE.BACKGROUND_COLORS.LAYER3
            }
        };

        nodes.push(node);

        if (component.node && Array.isArray(component.node)) {
            component.node.forEach(child => traverse(child, String(component.id), depth + 1));
        }
    };

    componentArray.forEach(component => traverse(component));
    return nodes;
}

//MARK: - 엣지 파싱
/**
 * JSON_TEMPLATE.json 파일을 파싱하여 초기 엣지를 생성하는 함수
 * @param {Object} data - 파싱할 JSON 데이터
 * @returns {Array} 초기 엣지 배열
 */

function parseConnections(data) {
    if (!data.connections || !Array.isArray(data.connections)) {
        throw new Error("유효한 connections 배열이 필요합니다.");
    }

    // connections 배열을 from 값 기준으로 숫자 정렬
    const sortedConnections = [...data.connections].sort((a, b) => {
        return parseInt(a.from) - parseInt(b.from);
    });

    return sortedConnections.map(({ from, to, text, color, direction, thickness, type }) => {
        if (!from || !to) {
            throw new Error("각 연결은 'from'과 'to' 필드를 가져야 합니다.");
        }

        return {
            id: `${from}-${to}`,
            source: String(from),
            target: String(to),
            label: text || "",
            type: 'floating',
            style: {
                stroke: color || '#555555',
                strokeWidth: thickness || '2',
                strokeDasharray: type === 'dashed' ? '5,5' :
                    type === 'dotted' ? '2,2' : 'none'
            },
            markerEnd: direction ? {
                type: 'arrowclosed',
                width: 10,
                height: 10,
                color: color || '#000000'
            } : {
                width: direction ? 10 : 0,
                height: direction ? 10 : 0,
                color: direction ? (color || '#000000') : 'transparent'
            }

        };
    });
}

export function createEdge({ source, target, label }) {
    return {
        id: `${source}-${target}`,
        source: String(source),
        target: String(target),
        label: label,
        labelStyle: { // label 스타일 추가
            fill: '#444',
            fontWeight: 500,
            fontSize: 12,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px'
        },
        type: 'floating',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10,
            height: 10,
            color: '#444',
            strokeWidth: 2,
        }
    };
}

//MARK: - IMPORT
/**
 * JSON_TEMPLATE.json 파일을 파싱하여 초기 그래프 데이터를 생성하는 함수
 * @param {String} jsonString - JSON 문자열
 * @returns {Object} 초기 노드와 엣지 배열
 */
function parseJSONtoReactFlowData(jsonString, onNodeLabelChange) {
    try {
        const data = JSON.parse(jsonString);
        const metadata = {
            file_name: data.file_name || "",
            summary: data.summary || ""
        };
        const parsedNodes = parseComponents(data, onNodeLabelChange);
        const parsedEdges = parseConnections(data);
        return {
            metadata,
            parsedNodes,
            parsedEdges
        };
    } catch (error) {
        console.error("JSON 파싱 에러:", error.message);
        return {
            metadata: {
                file_name: "",
                summary: ""
            },
            parsedNodes: [],
            parsedEdges: []
        };
    }
}

//MARK: - EXPORT
// ReactFlow 데이터를 원본 JSON 형식으로 변환하는 함수
export function convertReactFlowToJSON(metadata, nodes, edges) {
    // 최상위 노드들 찾기 (parentId가 없는 노드들)
    const rootNodes = nodes.filter(node => !node.parentId);

    // 컴포넌트 구조 생성
    const components = rootNodes.map(rootNode =>
        createComponentStructure(rootNode, nodes)
    );

    // 엣지 변환 및 숫자 기반 정렬
    const connections = edges
        .map(edge => ({
            from: edge.source,
            to: edge.target,
            text: edge.label || "",
            type: edge.style?.strokeDasharray === '5,5' ? 'dashed' :
                edge.style?.strokeDasharray === '2,2' ? 'dotted' : 'line',
            color: edge.style?.stroke || "#555555",
            direction: edge.markerEnd?.width > 0 && edge.markerEnd?.type === 'arrowclosed',
            thickness: edge.style?.strokeWidth || "2"
        }))
        .sort((a, b) => parseInt(a.from) - parseInt(b.from));

    // 최종 JSON 구조
    return {
        file_name: metadata.file_name,
        summary: metadata.summary,
        components,
        connections
    };
}

// 재귀적으로 컴포넌트 구조 생성
function createComponentStructure(currentNode, allNodes) {
    // 현재 노드의 직접적인 자식 노드들 찾기
    const childNodes = allNodes.filter(node => node.parentId === currentNode.id);

    return {
        id: currentNode.id,
        text: currentNode.data.label,
        node: childNodes.length > 0
            ? childNodes.map(childNode => createComponentStructure(childNode, allNodes))
            : []
    };
}

export { parseComponents, parseConnections, parseJSONtoReactFlowData };

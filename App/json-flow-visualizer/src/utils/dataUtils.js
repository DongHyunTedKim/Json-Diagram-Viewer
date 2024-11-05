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

function parseComponents(data) {
    if (!data.components || !Array.isArray(data.components)) {
        throw new Error("유효한 components 배열이 필요합니다.");
    }

    const nodes = [];

    const traverse = (component, parentId = null, depth = 1) => {
        if (!component.id || !component.text) {
            throw new Error("각 구성 요소는 고유한 id와 text를 가져야 합니다.");
        }

        // 노드 크기 계산
        const { width, height } = calculateNodeSize(component);

        const node = {
            id: String(component.id),
            data: { label: component.text + ' (Depth:' + depth + ')' },
            position: { x: 0, y: 0 },
            className: `Layer${depth}`,
            parentId: parentId,
            // 핸들 관련 속성 수정
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            // 핸들 표시 여부 명시적 설정
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

    data.components.forEach(component => traverse(component));

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

    return data.connections.map(({ from, to }) => {
        if (!from || !to) {
            throw new Error("각 연결은 'from'과 'to' 필드를 가져야 합니다.");
        }

        return createEdge({ source: from, target: to });
    });
}

// createEdge 함수 수정
export function createEdge({ source, target }) {
    return {
        id: `${source}-${target}`,
        source: String(source),
        target: String(target),
        type: 'floating',
        animated: false,
        interactionWidth: 12,
        style: {
            strokeWidth: FLOW_CONSTANTS.EDGE.STYLE.STROKE_WIDTH,
            stroke: FLOW_CONSTANTS.EDGE.STYLE.STROKE_COLOR,
            cursor: 'pointer'
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: FLOW_CONSTANTS.EDGE.MARKER.WIDTH,
            height: FLOW_CONSTANTS.EDGE.MARKER.HEIGHT,
            color: FLOW_CONSTANTS.EDGE.STYLE.STROKE_COLOR,
            strokeWidth: 2
        }
    };
}

/**
 * JSON_TEMPLATE.json 파일을 파싱하여 초기 그래프 데이터를 생성하는 함수
 * @param {String} jsonString - JSON 문자열
 * @returns {Object} 초기 노드와 엣지 배열
 */
function parseJSONtoReactFlowData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        const parsedNodes = parseComponents(data);
        const parsedEdges = parseConnections(data);
        return { parsedNodes, parsedEdges };
    } catch (error) {
        console.error("JSON 파싱 에러:", error.message);
        return { parsedNodes: [], parsedEdges: [] };
    }
}

export { parseComponents, parseConnections, parseJSONtoReactFlowData };

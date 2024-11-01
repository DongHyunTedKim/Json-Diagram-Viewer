// 데이터 파싱을 위한 유틸리티 함수

/**
 * JSON_TEMPLATE.json 파일을 파싱하여 초기 노드를 생성하는 함수
 * @param {Object} data - 파싱할 JSON 데이터
 * @returns {Array} 초기 노드 배열
 */
function parseComponents(data) {
    if (!data.components || !Array.isArray(data.components)) {
        throw new Error("유효한 components 배열이 필요합니다.");
    }

    const nodes = [];

    const traverse = (component, parentId = null, depth = 1) => {
        if (!component.id || !component.text) {
            throw new Error("각 구성 요소는 고유한 id와 text를 가져야 합니다.");
        }

        const node = {
            id: String(component.id),
            data: { label: 'Depth:' + depth + ' ' + component.text},
            position: { x: 0, y: 0 }, // 초기 위치 설정
            className: `Layer${depth}`, // 레이어 깊이에 따른 클래스 이름 설정
            parentId: parentId,
            //extent: parentId ? 'parent' : 'none',
            style: depth === 1 
            ? { backgroundColor: 'rgba(255, 0, 0, 0.2)', width: 1000, height: 600 }
            : depth === 2
                ? { backgroundColor: 'rgba(255, 0, 0, 0.2)', width: 500, height: 260 }
                : { width: 160, height: 60 }
            };

        nodes.push(node);

        if (component.node && Array.isArray(component.node)) {
            component.node.forEach(child => traverse(child, String(component.id), depth + 1));
        }
    };

    data.components.forEach(component => traverse(component));

    return nodes;
}

/**
 * JSON_TEMPLATE.json 파일을 파싱하여 초기 엣지를 생성하는 함수
 * @param {Object} data - 파싱할 JSON 데이터
 * @returns {Array} 초기 엣지 배열
 */
function parseConnections(data) {
    if (!data.connections || !Array.isArray(data.connections)) {
        throw new Error("유효한 connections 배열이 필요합니다.");
    }

    const edges = [];

    data.connections.forEach(connection => {
        const { from, to, text, type, color, direction, thickness } = connection;

        if (!from || !to) {
            throw new Error("각 연결은 'from'과 'to' 필드를 가져야 합니다.");
        }

        const edge = {
            id: `${from}-${to}`,
            source: String(from),
            target: String(to),
            label: text || '',
            type: type || 'default',
            style: {
                stroke: color || '#000',
                strokeWidth: thickness || 2,
            },
        };

        edges.push(edge);
    });

    return edges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: false,
        style: {
            stroke: '#333',
            strokeWidth: 1.5,
        },
        markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#333',
        },
    }));
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

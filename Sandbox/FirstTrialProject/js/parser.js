// js/parser.js

/**
 * JSON 데이터를 mermaid.js 문법으로 변환하는 함수
 * @param {Object} data - 변환할 JSON 데이터
 * @returns {string} - mermaid.js 문법 문자열
 */
function jsonToMermaid(data) {
    const connections = data.connections;

    // Helper function to sanitize connection text
    function sanitizeText(text) {
        if (!text) return text;
        // Replace newline characters with space
        return text.replace(/\n/g, ' ');
    }

    // Start building mermaid flowchart with Left-Right direction
    let mermaid = 'flowchart LR\n'; // Flowchart 방향 변경 반영

    // Map to keep track of components with sub_blocks
    const subgraphEntries = {};

    // Process components and sub_blocks
    data.components.forEach(component => {
        if (component.sub_blocks && component.sub_blocks.length > 0) {
            // Define subgraph
            mermaid += `    subgraph ${component.id}["${component.name}"]\n`;
            // Add sub_blocks as nodes within the subgraph
            component.sub_blocks.forEach(sub => {
                const subId = `N${sub.id}`;
                mermaid += `        ${subId}["${sub.name}"]\n`;
            });
            mermaid += '    end\n';
        } else {
            // Regular node
            const nodeId = `N${component.id}`;
            mermaid += `    ${nodeId}["${component.name}"]\n`;
        }
    });

    // Add connections
    connections.forEach((conn, index) => {
        let from = `N${conn.from}`;
        let to = `N${conn.to}`;
        let arrow = '-->';

        if (conn.direction === 'bi-directional') {
            arrow = '<-->';
        } else if (conn.direction === 'directional') {
            arrow = '-->';
        } else {
            // 기본값 설정
            arrow = '-->';
        }

        // Determine line style and construct edge syntax
        let edgeSyntax = `${from}${arrow}`;

        if (conn.text) {
            // 텍스트가 있는 경우 큰따옴표로 감싸기
            edgeSyntax += `|"${sanitizeText(conn.text)}"|${to}`;
        } else {
            // 텍스트가 없는 경우 직접 연결
            edgeSyntax += `${to}`;
        }

        // Assign a unique class for styling if needed
        let className = '';
        if (conn.color || conn.type === 'dotted-line') {
            className = `edge-${index}`;
            mermaid += `    ${edgeSyntax}:::${className}\n`;
        } else {
            mermaid += `    ${edgeSyntax}\n`;
        }

        // Prepare styles
        if (conn.color || conn.type === 'dotted-line') {
            const stroke = conn.color || 'black';
            const strokeDasharray = conn.type === 'dotted-line' ? '5,5' : '';
            // 쉼표로 속성 구분
            let style = `stroke:${stroke}, stroke-width:2px`;
            if (strokeDasharray) {
                style += `, stroke-dasharray:${strokeDasharray}`;
            }
            mermaid += `    classDef ${className} ${style}\n`;
        }
    });

    return mermaid;
}

/**
 * 연결 식별자를 생성하는 함수 (현재 사용되지 않음)
 * @param {Object} conn - 연결 객체
 * @returns {string} - Mermaid 엣지 식별자
 */
function getEdgeIdentifier(conn) {
    const from = `N${conn.from}`;
    const to = `N${conn.to}`;
    if (conn.direction === 'bi-directional') {
        return `${from}<-->${to}`;
    } else if (conn.type === 'dotted-line') {
        return `${from}-.->${to}`;
    } else {
        return `${from}-->${to}`;
    }
}

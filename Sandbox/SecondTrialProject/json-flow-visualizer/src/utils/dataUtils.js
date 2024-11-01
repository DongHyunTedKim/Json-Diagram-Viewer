export function parseComponents(components) {
  const nodes = [];

  const traverse = (component, parentId = null) => {
    const { id, text, node: childNodes } = component;

    // 빈 노드 배열을 가진 컴포넌트는 일반 노드로 처리
    if (!childNodes || (Array.isArray(childNodes) && childNodes.length === 0)) {
      const node = {
        id: id.toString(),
        type: 'default',  // 기본 노드 타입 사용
        data: { label: text || 'No Label' },
        position: { x: 0, y: 0 },
        style: { 
          width: 200, 
          height: 36,
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(119, 119, 119, 0.5)',
          borderRadius: '5px',
          padding: '10px'
        },
        parentNode: parentId,
        expandParent: true
      };
      nodes.push(node);
      return;
    }

    // 그룹 노드 처리
    const node = {
      id: id.toString(),
      type: 'group',  // ReactFlow의 그룹 노드 타입 사용
      data: { label: text || 'No Label' },
      position: { x: 0, y: 0 },
      style: { 
        background: 'rgba(240, 240, 240, 0.5)',
        border: '2px solid rgba(102, 102, 102, 0.5)',
        borderRadius: '8px',
        padding: '20px'
      },
      parentNode: parentId,
      expandParent: true
    };

    nodes.push(node);
    childNodes.forEach(child => traverse(child, id.toString()));
  };

  components.forEach(component => traverse(component));
  return nodes;
}

export function parseConnections(connections) {
  return connections.map(connection => ({
    id: `e${connection.from}-${connection.to}`,
    source: connection.from.toString(),
    target: connection.to.toString(),
    type: 'smoothstep',
    animated: false,
    label: connection.text || '',
    style: {
      stroke: 'rgba(0, 0, 0, 0.7)',
      strokeWidth: connection.thickness === 'medium' ? 3 : 2,
      curvature: 0.5,
      zIndex: 0
    },
    markerEnd: connection.direction ? {
      type: 'arrowclosed',
      width: 10,
      height: 10,
      color: '#000000',
    } : undefined,
    interactionWidth: 20  // 엣지 선택 영역 넓히기
  }));
}

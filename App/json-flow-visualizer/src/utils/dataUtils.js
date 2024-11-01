export function parseComponents(components) {
  const nodes = [];

  const traverse = (component, parentId = null) => {
    const { id, text, node: childNodes } = component;

    // 그룹 노드인지 확인
    const isGroup = childNodes && childNodes.length > 0;

    const node = {
      id: id.toString(),
      type: 'customNode',
      data: {
        label: text || 'No Label',
        isGroup
      },
      position: { x: 0, y: 0 },
      style: { 
        width: 200, 
        height: 36,
        background: isGroup ? '#f0f0f0' : 'white',
        border: isGroup ? '2px solid #666' : '1px solid #777',
        borderRadius: isGroup ? '8px' : '5px',
        padding: isGroup ? '20px' : '10px'
      },
      parentNode: parentId,
      extent: isGroup ? 'parent' : undefined,
      expandParent: true
    };

    nodes.push(node);

    if (isGroup) {
      childNodes.forEach(child => traverse(child, id.toString()));
    }
  };

  components.forEach(component => traverse(component));
  return nodes;
}

export function parseConnections(connections) {
  return connections.map(connection => ({
    id: `e${connection.from}-${connection.to}`,
    source: connection.from.toString(),
    target: connection.to.toString(),
    type: 'default',
    animated: false,
    label: connection.text || '',
    style: {
      stroke: '#000000',
      strokeWidth: connection.thickness === 'medium' ? 3 : 2
    },
    markerEnd: connection.direction ? {
      type: 'arrowclosed',
      width: 10,
      height: 10,
      color: '#000000',
    } : undefined
  }));
}

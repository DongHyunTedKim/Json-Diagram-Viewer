export function parseComponents(components) {
  const nodes = [];

  const traverse = (component) => {
    const { id, text, node: childNodes } = component;

    const node = {
      id: id.toString(),
      type: 'customNode',
      data: {
        label: text || 'No Label'
      },
      position: { x: 0, y: 0 },
      style: { width: 200, height: 36 }
    };

    console.log('Node created:', node);

    nodes.push(node);

    if (childNodes && childNodes.length > 0) {
      childNodes.forEach(child => traverse(child));
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
    type: 'smoothstep',
    animated: connection.direction === 'forward',
    label: connection.text || '',
    style: {
      stroke: connection.color || '#000',
      strokeWidth: connection.thickness === 'medium' ? 3 : 2
    },
    markerEnd: {
      type: 'arrowclosed',
    }
  }));
}

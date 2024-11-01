// src/utils/layoutUtils.js
import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 36;

export function applyLayout(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ 
    rankdir: direction,
    ranksep: 80,
    nodesep: 50
    });

    nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
    };
    return node;
    });
}
/**
 * Layered Graph Layout Engine for Flownix
 * Automatically calculates (x, y, width, height) coordinates and edge path points.
 */

export function calculateLayout(graph, options = {}) {
  const direction = (graph.direction || 'TD').toUpperCase();
  const config = {
    horizontalGap: options.horizontalGap || 60,
    verticalGap: options.verticalGap || 80,
    padding: options.padding || 60,
    minNodeWidth: 120,
    minNodeHeight: 50
  };

  const nodes = graph.nodes.map(n => ({ ...n }));
  const edges = graph.edges.map(e => ({ ...e }));

  if (nodes.length === 0) {
    return {
      direction,
      nodes: [],
      edges: [],
      bounds: { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 }
    };
  }

  // Map for quick node lookup
  const nodeMap = new Map();
  nodes.forEach(n => {
    // Estimate node dimensions based on label and shape
    const labelLen = (n.label || n.id).length;
    let width = Math.max(config.minNodeWidth, labelLen * 10 + 30);
    let height = config.minNodeHeight;

    if (n.type === 'decision') {
      width = Math.max(140, labelLen * 12 + 40);
      height = 70;
    } else if (n.type === 'circle') {
      const size = Math.max(80, labelLen * 10 + 20);
      width = size;
      height = size;
    } else if (n.type === 'rounded') {
      width = Math.max(120, labelLen * 10 + 36);
      height = 50;
    }

    n.width = width;
    n.height = height;
    n.level = 0;
    nodeMap.set(n.id, n);
  });

  // Calculate indegrees and adjacency for level calculation
  const inDegree = new Map();
  const childrenMap = new Map();
  const parentsMap = new Map();

  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    childrenMap.set(n.id, []);
    parentsMap.set(n.id, []);
  });

  edges.forEach(e => {
    if (nodeMap.has(e.from) && nodeMap.has(e.to)) {
      childrenMap.get(e.from).push(e.to);
      parentsMap.get(e.to).push(e.from);
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    }
  });

  // Assign layers (Topological Rank)
  const queue = nodes.filter(n => inDegree.get(n.id) === 0);
  if (queue.length === 0 && nodes.length > 0) {
    // Cyclic graph fallback: pick first node
    queue.push(nodes[0]);
  }

  const visited = new Set();
  queue.forEach(n => {
    n.level = 0;
    visited.add(n.id);
  });

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const children = childrenMap.get(current.id) || [];

    children.forEach(childId => {
      const childNode = nodeMap.get(childId);
      if (childNode) {
        childNode.level = Math.max(childNode.level, current.level + 1);
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push(childNode);
        }
      }
    });
  }

  // Group nodes by layer level
  const layersMap = new Map();
  nodes.forEach(n => {
    if (!layersMap.has(n.level)) {
      layersMap.set(n.level, []);
    }
    layersMap.get(n.level).push(n);
  });

  const levels = Array.from(layersMap.keys()).sort((a, b) => a - b);

  // Position nodes depending on direction (TD, LR, BT, RL)
  const isVertical = direction === 'TD' || direction === 'TB' || direction === 'BT';
  const isReversed = direction === 'BT' || direction === 'RL';

  // Calculate coordinates
  let currentLevelOffset = config.padding;

  levels.forEach(lvl => {
    const layerNodes = layersMap.get(lvl);
    
    // Find max node cross-dimension in this layer
    let maxCrossDim = 0;
    layerNodes.forEach(n => {
      const crossDim = isVertical ? n.height : n.width;
      if (crossDim > maxCrossDim) maxCrossDim = crossDim;
    });

    // Compute span along current layer (horizontal for TD, vertical for LR)
    let totalSpan = 0;
    layerNodes.forEach((n, idx) => {
      const dim = isVertical ? n.width : n.height;
      totalSpan += dim + (idx < layerNodes.length - 1 ? config.horizontalGap : 0);
    });

    let currentSpanOffset = config.padding;

    layerNodes.forEach(n => {
      if (isVertical) {
        n.x = currentSpanOffset;
        n.y = isReversed ? 1000 - currentLevelOffset : currentLevelOffset;
        currentSpanOffset += n.width + config.horizontalGap;
      } else {
        n.x = isReversed ? 1000 - currentLevelOffset : currentLevelOffset;
        n.y = currentSpanOffset;
        currentSpanOffset += n.height + config.verticalGap;
      }
    });

    currentLevelOffset += maxCrossDim + (isVertical ? config.verticalGap : config.horizontalGap);
  });

  // Calculate Edge Paths & Anchor Points
  const layoutEdges = edges.map(edge => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (!fromNode || !toNode) {
      return { ...edge, path: '' };
    }

    let x1, y1, x2, y2;

    if (direction === 'TD' || direction === 'TB') {
      x1 = fromNode.x + fromNode.width / 2;
      y1 = fromNode.y + fromNode.height;
      x2 = toNode.x + toNode.width / 2;
      y2 = toNode.y;
    } else if (direction === 'LR') {
      x1 = fromNode.x + fromNode.width;
      y1 = fromNode.y + fromNode.height / 2;
      x2 = toNode.x;
      y2 = toNode.y + toNode.height / 2;
    } else if (direction === 'RL') {
      x1 = fromNode.x;
      y1 = fromNode.y + fromNode.height / 2;
      x2 = toNode.x + toNode.width;
      y2 = toNode.y + toNode.height / 2;
    } else { // BT
      x1 = fromNode.x + fromNode.width / 2;
      y1 = fromNode.y;
      x2 = toNode.x + toNode.width / 2;
      y2 = toNode.y + toNode.height;
    }

    // Bezier control points for smooth path
    let path = '';
    if (isVertical) {
      const deltaY = Math.abs(y2 - y1) / 2;
      const cy1 = y1 < y2 ? y1 + deltaY : y1 - deltaY;
      const cy2 = y1 < y2 ? y2 - deltaY : y2 + deltaY;
      path = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
    } else {
      const deltaX = Math.abs(x2 - x1) / 2;
      const cx1 = x1 < x2 ? x1 + deltaX : x1 - deltaX;
      const cx2 = x1 < x2 ? x2 - deltaX : x2 + deltaX;
      path = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
    }

    // Label anchor position (midpoint)
    const lx = (x1 + x2) / 2;
    const ly = (y1 + y2) / 2;

    return {
      ...edge,
      x1, y1, x2, y2,
      lx, ly,
      path
    };
  });

  // Calculate canvas bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 400; maxY = 300;
  } else {
    minX = Math.max(0, minX - config.padding);
    minY = Math.max(0, minY - config.padding);
    maxX += config.padding;
    maxY += config.padding;
  }

  const width = Math.max(400, maxX - minX);
  const height = Math.max(300, maxY - minY);

  return {
    direction,
    nodes,
    edges: layoutEdges,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height
    }
  };
}

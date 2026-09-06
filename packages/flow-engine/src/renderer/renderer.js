/**
 * Framework-Agnostic SVG Renderer for Flownix
 * Renders graph layout objects into clean, responsive SVG strings or SVG structured output.
 */

export const themes = {
  dark: {
    bg: '#0f172a',
    nodeBg: '#1e293b',
    nodeBorder: '#38bdf8',
    textColor: '#f8fafc',
    edgeColor: '#94a3b8',
    labelBg: '#334155',
    decisionBg: '#1e1b4b',
    decisionBorder: '#818cf8',
    arrowColor: '#38bdf8'
  },
  light: {
    bg: '#ffffff',
    nodeBg: '#f8fafc',
    nodeBorder: '#0284c7',
    textColor: '#0f172a',
    edgeColor: '#64748b',
    labelBg: '#e2e8f0',
    decisionBg: '#e0e7ff',
    decisionBorder: '#4f46e5',
    arrowColor: '#0284c7'
  }
};

export function renderSVG(layoutResult, options = {}) {
  const themeName = options.theme || 'dark';
  const theme = typeof themeName === 'string' ? (themes[themeName] || themes.dark) : themeName;
  const bounds = layoutResult.bounds || { width: 600, height: 400 };

  const markerId = `arrowhead-${Math.random().toString(36).substring(2, 7)}`;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bounds.width} ${bounds.height}" width="100%" height="100%" style="background-color: ${theme.bg}; font-family: system-ui, -apple-system, sans-serif;">\n`;
  
  // Defs & Arrowhead Markers
  svg += `  <defs>\n`;
  svg += `    <marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">\n`;
  svg += `      <path d="M 0 1 L 10 5 L 0 9 z" fill="${theme.arrowColor}" />\n`;
  svg += `    </marker>\n`;
  svg += `  </defs>\n\n`;

  // Render Edges
  svg += `  <!-- Edges -->\n`;
  svg += `  <g class="edges">\n`;
  (layoutResult.edges || []).forEach(edge => {
    svg += `    <path d="${edge.path}" fill="none" stroke="${theme.edgeColor}" stroke-width="2.5" marker-end="url(#${markerId})" stroke-linecap="round" />\n`;
    if (edge.label) {
      const labelPadding = 6;
      const approxWidth = edge.label.length * 7 + labelPadding * 2;
      svg += `    <g class="edge-label" transform="translate(${edge.lx}, ${edge.ly})">\n`;
      svg += `      <rect x="-${approxWidth / 2}" y="-12" width="${approxWidth}" height="20" rx="4" fill="${theme.labelBg}" stroke="${theme.edgeColor}" stroke-width="1" />\n`;
      svg += `      <text x="0" y="2" text-anchor="middle" dominant-baseline="middle" fill="${theme.textColor}" font-size="11" font-weight="500">${escapeHTML(edge.label)}</text>\n`;
      svg += `    </g>\n`;
    }
  });
  svg += `  </g>\n\n`;

  // Render Nodes
  svg += `  <!-- Nodes -->\n`;
  svg += `  <g class="nodes">\n`;
  (layoutResult.nodes || []).forEach(node => {
    const { x, y, width, height, label, type, id } = node;

    svg += `    <g class="node node-${type}" id="node-${id}" transform="translate(${x}, ${y})">\n`;

    if (type === 'decision') {
      const points = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;
      svg += `      <polygon points="${points}" fill="${theme.decisionBg}" stroke="${theme.decisionBorder}" stroke-width="2.5" />\n`;
    } else if (type === 'circle') {
      const r = Math.min(width, height) / 2;
      svg += `      <circle cx="${width / 2}" cy="${height / 2}" r="${r}" fill="${theme.nodeBg}" stroke="${theme.nodeBorder}" stroke-width="2.5" />\n`;
    } else if (type === 'rounded') {
      svg += `      <rect x="0" y="0" width="${width}" height="${height}" rx="20" ry="20" fill="${theme.nodeBg}" stroke="${theme.nodeBorder}" stroke-width="2.5" />\n`;
    } else {
      // Rectangle (default)
      svg += `      <rect x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="${theme.nodeBg}" stroke="${theme.nodeBorder}" stroke-width="2.5" />\n`;
    }

    svg += `      <text x="${width / 2}" y="${height / 2 + 1}" text-anchor="middle" dominant-baseline="middle" fill="${theme.textColor}" font-size="14" font-weight="600">${escapeHTML(label)}</text>\n`;
    svg += `    </g>\n`;
  });
  svg += `  </g>\n`;

  svg += `</svg>`;

  return svg;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

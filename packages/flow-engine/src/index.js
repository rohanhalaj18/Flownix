import { Tokenizer } from './tokenizer/tokenizer.js';
import { parse, Parser } from './parser/parser.js';
import { calculateLayout } from './layout/layout.js';
import { renderSVG, themes } from './renderer/renderer.js';

export { Tokenizer, Parser, parse, calculateLayout, renderSVG, themes };

/**
 * Main engine entry point: Converts raw flowchart DSL text into an interactive diagram representation.
 * @param {string} sourceCode - Diagram source code (e.g., "A[Start] --> B[End]")
 * @param {object} options - Renderer and layout options (e.g., { theme: 'dark' })
 * @returns {object} { graph, layout, svg, errors }
 */
export function createDiagram(sourceCode, options = {}) {
  const parsedGraph = parse(sourceCode || '');

  if (parsedGraph.errors && parsedGraph.errors.length > 0) {
    return {
      graph: parsedGraph,
      layout: null,
      svg: null,
      errors: parsedGraph.errors
    };
  }

  const layout = calculateLayout(parsedGraph, options);
  const svg = renderSVG(layout, options);

  return {
    graph: parsedGraph,
    layout,
    svg,
    errors: []
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiagram, parse, Tokenizer } from '../src/index.js';

test('Tokenizer splits basic flowchart input correctly', () => {
  const input = 'A[Start] --> B[End]';
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  assert.equal(tokens[0].value, 'A');
  assert.equal(tokens[1].value, 'Start');
  assert.equal(tokens[2].value, '-->');
  assert.equal(tokens[3].value, 'B');
  assert.equal(tokens[4].value, 'End');
});

test('Parser parses basic rectangle flow diagram syntax', () => {
  const input = `flowchart TD
  A[Start] --> B[End]`;

  const parsed = parse(input);
  assert.equal(parsed.direction, 'TD');
  assert.equal(parsed.nodes.length, 2);
  assert.equal(parsed.nodes[0].id, 'A');
  assert.equal(parsed.nodes[0].label, 'Start');
  assert.equal(parsed.nodes[1].id, 'B');
  assert.equal(parsed.nodes[1].label, 'End');
  assert.equal(parsed.edges.length, 1);
  assert.equal(parsed.edges[0].from, 'A');
  assert.equal(parsed.edges[0].to, 'B');
});

test('Parser parses decision diamonds, circle, rounded nodes and edge labels', () => {
  const input = `flowchart LR
  A((Start)) --> B[Login]
  B --> C{Valid?}
  C -->|Yes| D[Dashboard]
  C -->|No| E(Error)`;

  const parsed = parse(input);
  assert.equal(parsed.direction, 'LR');
  assert.equal(parsed.nodes.length, 5);

  const nodeA = parsed.nodes.find(n => n.id === 'A');
  assert.equal(nodeA.type, 'circle');
  assert.equal(nodeA.label, 'Start');

  const nodeC = parsed.nodes.find(n => n.id === 'C');
  assert.equal(nodeC.type, 'decision');
  assert.equal(nodeC.label, 'Valid?');

  const nodeE = parsed.nodes.find(n => n.id === 'E');
  assert.equal(nodeE.type, 'rounded');
  assert.equal(nodeE.label, 'Error');

  const edgeYes = parsed.edges.find(e => e.from === 'C' && e.to === 'D');
  assert.equal(edgeYes.label, 'Yes');

  const edgeNo = parsed.edges.find(e => e.from === 'C' && e.to === 'E');
  assert.equal(edgeNo.label, 'No');
});

test('Parser reports syntax error for invalid arrow', () => {
  const input = `A[Start] ---> B[End]`;
  const parsed = parse(input);
  assert.ok(parsed.errors.length > 0);
  assert.match(parsed.errors[0].message, /Unexpected token "--->"/);
});

test('createDiagram generates full layout and SVG with custom shapes and labels', () => {
  const input = `flowchart TD
  A[Start] --> B{Valid?}
  B -->|Yes| C((Success))`;

  const result = createDiagram(input, { theme: 'dark' });
  assert.equal(result.errors.length, 0);
  assert.ok(result.layout);
  assert.ok(result.svg.includes('<svg'));
  assert.ok(result.svg.includes('polygon')); // decision diamond
  assert.ok(result.svg.includes('circle'));  // circle node
  assert.ok(result.svg.includes('Yes'));     // edge label
});

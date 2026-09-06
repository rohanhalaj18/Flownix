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

test('Parser reports syntax error for invalid arrow', () => {
  const input = `A[Start] ---> B[End]`;
  const parsed = parse(input);
  assert.ok(parsed.errors.length > 0);
  assert.match(parsed.errors[0].message, /Unexpected token "--->"/);
});

test('createDiagram generates full layout and SVG output', () => {
  const result = createDiagram('A[Start] --> B[End]');
  assert.equal(result.errors.length, 0);
  assert.ok(result.layout);
  assert.ok(result.svg.includes('<svg'));
  assert.ok(result.svg.includes('Start'));
  assert.ok(result.svg.includes('End'));
});

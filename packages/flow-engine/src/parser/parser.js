import { Tokenizer, TokenType } from '../tokenizer/tokenizer.js';

export class Parser {
  constructor(input) {
    this.tokenizer = new Tokenizer(input);
    this.tokens = this.tokenizer.tokenize();
    this.pos = 0;
  }

  peek(offset = 0) {
    const idx = this.pos + offset;
    return idx < this.tokens.length ? this.tokens[idx] : this.tokens[this.tokens.length - 1];
  }

  read() {
    const token = this.peek();
    if (this.pos < this.tokens.length - 1) {
      this.pos++;
    }
    return token;
  }

  parse() {
    const graph = {
      direction: 'TD',
      nodes: [],
      edges: [],
      errors: []
    };

    const nodeMap = new Map();

    const getOrCreateNode = (id, label = null, type = null) => {
      if (nodeMap.has(id)) {
        const existing = nodeMap.get(id);
        if (label && (!existing.label || existing.label === id)) {
          existing.label = label;
        }
        if (type && existing.type === 'rectangle') {
          existing.type = type;
        }
        return existing;
      }

      const newNode = {
        id,
        label: label || id,
        type: type || 'rectangle'
      };
      nodeMap.set(id, newNode);
      graph.nodes.push(newNode);
      return newNode;
    };

    const skipNewlines = () => {
      while (this.peek().type === TokenType.NEWLINE) {
        this.read();
      }
    };

    skipNewlines();

    // Check Header and Direction (e.g., "flowchart TD" or "graph LR" or "TD")
    if (this.peek().type === TokenType.HEADER) {
      this.read();
      skipNewlines();
      if (this.peek().type === TokenType.DIRECTION) {
        graph.direction = this.read().value;
      }
    } else if (this.peek().type === TokenType.DIRECTION) {
      graph.direction = this.read().value;
    }

    skipNewlines();

    // Helper to parse node definition details
    const parseNodeDetails = () => {
      if (this.peek().type !== TokenType.IDENTIFIER) {
        return null;
      }

      const idToken = this.read();
      const id = idToken.value;
      let label = null;
      let type = 'rectangle';

      const nextToken = this.peek();
      if (nextToken.type === TokenType.LABEL_RECT) {
        label = this.read().value;
        type = 'rectangle';
      } else if (nextToken.type === TokenType.LABEL_DECISION) {
        label = this.read().value;
        type = 'decision';
      } else if (nextToken.type === TokenType.LABEL_CIRCLE) {
        label = this.read().value;
        type = 'circle';
      } else if (nextToken.type === TokenType.LABEL_ROUNDED) {
        label = this.read().value;
        type = 'rounded';
      }

      const node = getOrCreateNode(id, label, type);
      return { id, node, token: idToken };
    };

    // Parse statements
    while (this.peek().type !== TokenType.EOF) {
      if (this.peek().type === TokenType.NEWLINE) {
        this.read();
        continue;
      }

      const sourceInfo = parseNodeDetails();
      if (!sourceInfo) {
        const errToken = this.read();
        graph.errors.push({
          line: errToken.line,
          col: errToken.col,
          message: `Syntax Error at line ${errToken.line}: Unexpected token "${errToken.value}"`
        });

        while (this.peek().type !== TokenType.NEWLINE && this.peek().type !== TokenType.EOF) {
          this.read();
        }
        skipNewlines();
        continue;
      }

      let currentSourceId = sourceInfo.id;

      // Handle chained edge connections on the same line: A --> B --> C
      while (this.peek().type === TokenType.ARROW) {
        const arrowToken = this.read();

        if (arrowToken.value !== '-->') {
          graph.errors.push({
            line: arrowToken.line,
            col: arrowToken.col,
            message: `Syntax Error at line ${arrowToken.line}: Unexpected token "${arrowToken.value}". Expected "-->"`
          });
          break;
        }

        // Optional Edge Label: |Label|
        let edgeLabel = null;
        if (this.peek().type === TokenType.LABEL_PIPE) {
          edgeLabel = this.read().value;
        }

        const targetInfo = parseNodeDetails();
        if (!targetInfo) {
          graph.errors.push({
            line: arrowToken.line,
            col: arrowToken.col,
            message: `Syntax Error at line ${arrowToken.line}: Expected target node after "-->"`
          });
          break;
        }

        graph.edges.push({
          from: currentSourceId,
          to: targetInfo.id,
          label: edgeLabel
        });

        // Continue chain with target node as next source
        currentSourceId = targetInfo.id;
      }

      // Fast forward to next line if lingering tokens exist on current line
      while (this.peek().type !== TokenType.NEWLINE && this.peek().type !== TokenType.EOF) {
        this.read();
      }
      skipNewlines();
    }

    return graph;
  }
}

export function parse(input) {
  const parser = new Parser(input);
  return parser.parse();
}

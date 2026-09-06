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

    const getOrCreateNode = (id, label = null, type = 'rectangle') => {
      if (nodeMap.has(id)) {
        const existing = nodeMap.get(id);
        if (label && (!existing.label || existing.label === id)) {
          existing.label = label;
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

    // Helper to skip newlines
    const skipNewlines = () => {
      while (this.peek().type === TokenType.NEWLINE) {
        this.read();
      }
    };

    skipNewlines();

    // Check for optional Header and Direction (e.g. flowchart TD or TD)
    if (this.peek().type === TokenType.HEADER) {
      this.read(); // consume header keyword ('flowchart' / 'graph')
      skipNewlines();
      if (this.peek().type === TokenType.DIRECTION) {
        graph.direction = this.read().value;
      }
    } else if (this.peek().type === TokenType.DIRECTION) {
      graph.direction = this.read().value;
    }

    skipNewlines();

    // Parse statements
    while (this.peek().type !== TokenType.EOF) {
      const currentToken = this.peek();

      if (currentToken.type === TokenType.NEWLINE) {
        this.read();
        continue;
      }

      // Parse Node Definition or Connection
      if (currentToken.type === TokenType.IDENTIFIER) {
        const sourceIdToken = this.read();
        const sourceId = sourceIdToken.value;

        let sourceType = 'rectangle';
        let sourceLabel = null;

        // Check if node shape label is attached immediately: A[Start], A{Valid?}, etc.
        const nextToken = this.peek();
        if (nextToken.type === TokenType.LABEL_RECT) {
          sourceLabel = this.read().value;
          sourceType = 'rectangle';
        } else if (nextToken.type === TokenType.LABEL_DECISION) {
          sourceLabel = this.read().value;
          sourceType = 'decision';
        } else if (nextToken.type === TokenType.LABEL_CIRCLE) {
          sourceLabel = this.read().value;
          sourceType = 'circle';
        } else if (nextToken.type === TokenType.LABEL_ROUNDED) {
          sourceLabel = this.read().value;
          sourceType = 'rounded';
        }

        getOrCreateNode(sourceId, sourceLabel, sourceType);

        // Check for edge connection: -->
        const maybeArrow = this.peek();
        if (maybeArrow.type === TokenType.ARROW) {
          const arrowToken = this.read();

          // Validate exact arrow syntax
          if (arrowToken.value !== '-->') {
            graph.errors.push({
              line: arrowToken.line,
              col: arrowToken.col,
              message: `Syntax Error at line ${arrowToken.line}: Unexpected token "${arrowToken.value}". Expected "-->"`
            });
            // Try to recover by advancing line
            while (this.peek().type !== TokenType.NEWLINE && this.peek().type !== TokenType.EOF) {
              this.read();
            }
            continue;
          }

          // Optional Edge Label: |Yes|
          let edgeLabel = null;
          if (this.peek().type === TokenType.LABEL_PIPE) {
            edgeLabel = this.read().value;
          }

          // Target node identifier
          if (this.peek().type === TokenType.IDENTIFIER) {
            const targetIdToken = this.read();
            const targetId = targetIdToken.value;

            let targetType = 'rectangle';
            let targetLabel = null;

            const targetShapeToken = this.peek();
            if (targetShapeToken.type === TokenType.LABEL_RECT) {
              targetLabel = this.read().value;
              targetType = 'rectangle';
            } else if (targetShapeToken.type === TokenType.LABEL_DECISION) {
              targetLabel = this.read().value;
              targetType = 'decision';
            } else if (targetShapeToken.type === TokenType.LABEL_CIRCLE) {
              targetLabel = this.read().value;
              targetType = 'circle';
            } else if (targetShapeToken.type === TokenType.LABEL_ROUNDED) {
              targetLabel = this.read().value;
              targetType = 'rounded';
            }

            getOrCreateNode(targetId, targetLabel, targetType);

            graph.edges.push({
              from: sourceId,
              to: targetId,
              label: edgeLabel
            });
          } else {
            graph.errors.push({
              line: arrowToken.line,
              col: arrowToken.col,
              message: `Syntax Error at line ${arrowToken.line}: Expected target node after "${arrowToken.value}"`
            });
          }
        }
      } else {
        // Unexpected token
        const errToken = this.read();
        graph.errors.push({
          line: errToken.line,
          col: errToken.col,
          message: `Syntax Error at line ${errToken.line}: Unexpected token "${errToken.value}"`
        });

        // Fast forward to next line
        while (this.peek().type !== TokenType.NEWLINE && this.peek().type !== TokenType.EOF) {
          this.read();
        }
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

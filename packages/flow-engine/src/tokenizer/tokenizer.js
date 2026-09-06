/**
 * Tokenizer for Flownix DSL
 * Converts diagram source text into structured tokens with location metadata.
 */

export const TokenType = {
  HEADER: 'HEADER',
  DIRECTION: 'DIRECTION',
  IDENTIFIER: 'IDENTIFIER',
  LABEL_RECT: 'LABEL_RECT',      // [Text]
  LABEL_DECISION: 'LABEL_DECISION', // {Text}
  LABEL_CIRCLE: 'LABEL_CIRCLE',   // ((Text))
  LABEL_ROUNDED: 'LABEL_ROUNDED',  // (Text)
  ARROW: 'ARROW',                // -->
  LABEL_PIPE: 'LABEL_PIPE',      // |Label|
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};

export class Tokenizer {
  constructor(input) {
    this.input = input || '';
    this.length = this.input.length;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  peek(offset = 0) {
    const idx = this.pos + offset;
    return idx < this.length ? this.input[idx] : null;
  }

  read() {
    const ch = this.peek();
    if (ch === null) return null;
    this.pos++;
    if (ch === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return ch;
  }

  tokenize() {
    const tokens = [];

    while (this.pos < this.length) {
      const startLine = this.line;
      const startCol = this.col;
      const ch = this.peek();

      // Skip whitespace except newlines
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.read();
        continue;
      }

      // Handle Newlines
      if (ch === '\n') {
        this.read();
        tokens.push({ type: TokenType.NEWLINE, value: '\n', line: startLine, col: startCol });
        continue;
      }

      // Handle comments (% or %%)
      if (ch === '%') {
        while (this.peek() !== null && this.peek() !== '\n') {
          this.read();
        }
        continue;
      }

      // Handle Arrow -->
      if (ch === '-' && this.peek(1) === '-' && this.peek(2) === '>') {
        this.read(); this.read(); this.read();
        tokens.push({ type: TokenType.ARROW, value: '-->', line: startLine, col: startCol });
        continue;
      }

      // Detect incorrect arrow tokens like ---> or ----> for detailed error messages
      if (ch === '-' && this.peek(1) === '-') {
        let dashes = '';
        while (this.peek() === '-') {
          dashes += this.read();
        }
        if (this.peek() === '>') {
          dashes += this.read();
        }
        tokens.push({ type: TokenType.ARROW, value: dashes, line: startLine, col: startCol });
        continue;
      }

      // Handle Pipe labels |Label|
      if (ch === '|') {
        this.read(); // skip '|'
        let labelText = '';
        while (this.peek() !== null && this.peek() !== '|' && this.peek() !== '\n') {
          labelText += this.read();
        }
        if (this.peek() === '|') {
          this.read(); // skip closing '|'
        }
        tokens.push({ type: TokenType.LABEL_PIPE, value: labelText.trim(), line: startLine, col: startCol });
        continue;
      }

      // Handle Node Shapes & Labels
      // Circle ((Text))
      if (ch === '(' && this.peek(1) === '(') {
        this.read(); this.read();
        let content = '';
        while (this.peek() !== null && !(this.peek() === ')' && this.peek(1) === ')')) {
          content += this.read();
        }
        if (this.peek() === ')' && this.peek(1) === ')') {
          this.read(); this.read();
        }
        tokens.push({ type: TokenType.LABEL_CIRCLE, value: content.trim(), line: startLine, col: startCol });
        continue;
      }

      // Rounded rectangle (Text)
      if (ch === '(') {
        this.read();
        let content = '';
        while (this.peek() !== null && this.peek() !== ')' && this.peek() !== '\n') {
          content += this.read();
        }
        if (this.peek() === ')') {
          this.read();
        }
        tokens.push({ type: TokenType.LABEL_ROUNDED, value: content.trim(), line: startLine, col: startCol });
        continue;
      }

      // Rectangle [Text]
      if (ch === '[') {
        this.read();
        let content = '';
        while (this.peek() !== null && this.peek() !== ']' && this.peek() !== '\n') {
          content += this.read();
        }
        if (this.peek() === ']') {
          this.read();
        }
        tokens.push({ type: TokenType.LABEL_RECT, value: content.trim(), line: startLine, col: startCol });
        continue;
      }

      // Decision diamond {Text}
      if (ch === '{') {
        this.read();
        let content = '';
        while (this.peek() !== null && this.peek() !== '}' && this.peek() !== '\n') {
          content += this.read();
        }
        if (this.peek() === '}') {
          this.read();
        }
        tokens.push({ type: TokenType.LABEL_DECISION, value: content.trim(), line: startLine, col: startCol });
        continue;
      }

      // Identifiers & Keywords (flowchart, TD, A, B, etc.)
      if (/[a-zA-Z0-9_-]/.test(ch)) {
        let value = '';
        while (this.peek() !== null && /[a-zA-Z0-9_-]/.test(this.peek())) {
          value += this.read();
        }

        const upperVal = value.toUpperCase();
        if (upperVal === 'FLOWCHART' || upperVal === 'GRAPH') {
          tokens.push({ type: TokenType.HEADER, value, line: startLine, col: startCol });
        } else if (['TD', 'TB', 'LR', 'RL', 'BT'].includes(upperVal)) {
          tokens.push({ type: TokenType.DIRECTION, value: upperVal, line: startLine, col: startCol });
        } else {
          tokens.push({ type: TokenType.IDENTIFIER, value, line: startLine, col: startCol });
        }
        continue;
      }

      // Unrecognized character fallback
      const unknownChar = this.read();
      tokens.push({ type: TokenType.IDENTIFIER, value: unknownChar, line: startLine, col: startCol });
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line, col: this.col });
    return tokens;
  }
}

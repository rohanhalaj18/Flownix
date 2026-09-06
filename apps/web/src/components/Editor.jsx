import React from 'react';

export function Editor({ value, onChange, errors }) {
  const lines = value.split('\n');

  return (
    <div className="editor-pane">
      <div className="pane-header">
        <span>Diagram Syntax</span>
        <span>{lines.length} lines</span>
      </div>

      <div className="editor-wrapper">
        <div className="line-numbers">
          {lines.map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        <textarea
          className="code-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="flowchart TD&#10;A[Start] --> B[End]"
          spellCheck="false"
        />
      </div>

      {errors && errors.length > 0 && (
        <div className="error-banner">
          <strong>Syntax Error:</strong>
          {errors.map((err, i) => (
            <div key={i}>{err.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}

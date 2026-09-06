import React from 'react';

export function Toolbar({ theme, onToggleTheme, onSelectPreset, hasError }) {
  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-logo">F</div>
        <span className="brand-title">Flownix</span>
        <span className="badge">Milestone 1</span>
      </div>

      <div className="actions">
        <button
          className="btn"
          onClick={() => onSelectPreset('A[Start] --> B[End]')}
        >
          Preset: Basic Rect
        </button>

        <button className="btn" onClick={onToggleTheme}>
          Theme: {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <a
          className="btn btn-primary"
          href="https://github.com/rohanhalaj18/Flownix"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Repository
        </a>
      </div>
    </header>
  );
}

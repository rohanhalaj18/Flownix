import React from 'react';
import { ExportMenu } from './ExportMenu';

const PRESETS = {
  auth: `flowchart TD

A((Start)) --> B[Login]
B --> C{Valid Credentials?}
C -->|Yes| D[Dashboard]
C -->|No| E(Show Error)`,

  horizontal: `flowchart LR

A[User Request] --> B{Cache Hit?}
B -->|Yes| C[Return Cached Data]
B -->|No| D[Query Database]
D --> E[Update Cache]
E --> C`,

  shapes: `flowchart TD

A((Circle Node)) --> B[Rectangle Node]
B --> C(Rounded Rectangle)
C --> D{Decision Diamond?}`
};

export function Toolbar({ theme, onToggleTheme, onSelectPreset, svgContent }) {
  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-logo">F</div>
        <span className="brand-title">Flownix</span>
        <span className="badge">Milestone 4</span>
      </div>

      <div className="actions">
        <button
          className="btn"
          onClick={() => onSelectPreset(PRESETS.auth)}
        >
          Preset: Auth Flow
        </button>

        <button
          className="btn"
          onClick={() => onSelectPreset(PRESETS.horizontal)}
        >
          Preset: Horizontal (LR)
        </button>

        <button
          className="btn"
          onClick={() => onSelectPreset(PRESETS.shapes)}
        >
          Preset: Shapes Showcase
        </button>

        <button className="btn" onClick={onToggleTheme}>
          Theme: {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <ExportMenu svgContent={svgContent} filename="flownix-diagram" />

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

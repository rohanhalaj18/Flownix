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

export function Toolbar({
  theme,
  onToggleTheme,
  onSelectPreset,
  svgContent,
  user,
  onOpenAuth,
  onOpenSave,
  onOpenDashboard,
  onOpenShare,
  onLogout
}) {
  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brand-logo">F</div>
        <span className="brand-title">Flownix</span>
        <span className="badge">v1.0.0</span>
      </div>

      <div className="actions">
        <button className="btn" onClick={() => onSelectPreset(PRESETS.auth)}>
          Auth Preset
        </button>

        <button className="btn" onClick={() => onSelectPreset(PRESETS.horizontal)}>
          Horizontal
        </button>

        <button className="btn" onClick={onToggleTheme}>
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <ExportMenu svgContent={svgContent} filename="flownix-diagram" />

        {user ? (
          <>
            <button className="btn" onClick={onOpenSave}>
              💾 Save
            </button>
            <button className="btn" onClick={onOpenDashboard}>
              📂 My Diagrams
            </button>
            <button className="btn" onClick={onOpenShare}>
              🔗 Share
            </button>

            <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600', padding: '0 4px' }}>
              👤 {user.username}
            </span>

            <button
              className="btn"
              style={{ fontSize: '0.75rem' }}
              onClick={onLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onOpenAuth}>
            🔐 Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}

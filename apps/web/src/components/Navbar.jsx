import React from 'react';
import { ExportMenu } from './ExportMenu';

export function Navbar({
  theme,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  svgContent,
  user,
  onOpenAuth,
  onOpenSave,
  onOpenDashboard,
  onOpenShare,
  onLogout
}) {
  return (
    <nav className="navbar">
      <div className="brand" onClick={() => onToggleViewMode('landing')}>
        <div className="brand-logo">F</div>
        <span className="brand-title">Flownix</span>
        <span className="badge">v1.0.0</span>
      </div>

      <div className="nav-links">
        <span className="nav-item" onClick={() => onToggleViewMode('landing')}>
          Home
        </span>
        <span className="nav-item" onClick={() => onToggleViewMode('studio')}>
          Studio
        </span>
        <a
          className="nav-item"
          href="https://github.com/rohanhalaj18/Flownix"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>

      <div className="actions">
        <button className="btn" onClick={onToggleTheme} title="Toggle Theme">
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        {viewMode === 'studio' && (
          <ExportMenu svgContent={svgContent} filename="flownix-diagram" />
        )}

        {viewMode === 'landing' ? (
          <button className="btn btn-primary" onClick={() => onToggleViewMode('studio')}>
            Open Studio ⚡
          </button>
        ) : (
          <>
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
                <button className="btn" style={{ fontSize: '0.75rem' }} onClick={onLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={onOpenAuth}>
                🔐 Sign In
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

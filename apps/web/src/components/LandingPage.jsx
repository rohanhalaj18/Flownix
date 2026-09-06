import React, { useState, useEffect } from 'react';
import { createDiagram } from '@flownix/engine';

const SAMPLE_DSL = `flowchart TD

A((Start)) --> B[User Request]
B --> C{Cache Valid?}
C -->|Yes| D[Return Response]
C -->|No| E(Query Database)
E --> F[Update Cache]
F --> D`;

export function LandingPage({ onOpenStudio, onSelectPreset, theme }) {
  const [heroCode, setHeroCode] = useState(SAMPLE_DSL);
  const [heroDiagram, setHeroDiagram] = useState(() => createDiagram(SAMPLE_DSL, { theme }));

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        setHeroDiagram(createDiagram(heroCode, { theme }));
      } catch (err) {
        // Ignore live editing errors in playground
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [heroCode, theme]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <span>⚡ Open-Source Custom Flowchart Engine</span>
          <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>• v1.0.0</span>
        </div>

        <h1 className="hero-title">
          Turn Text into Beautiful <br />
          <span className="hero-title-highlight">Flowcharts in Seconds</span>
        </h1>

        <p className="hero-subtitle">
          Write clean, human-readable DSL syntax and render responsive SVG diagrams instantly.
          Built with a lightweight custom diagram engine — zero external dependencies.
        </p>

        <div className="hero-ctas">
          <button className="btn btn-primary btn-large" onClick={onOpenStudio}>
            Open Studio Editor ⚡
          </button>

          <a
            className="btn btn-large"
            href="https://github.com/rohanhalaj18/Flownix"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub 🐙
          </a>
        </div>

        {/* Live Hero Playground Card */}
        <div className="hero-playground">
          <div className="playground-header">
            <span>Interactive Playground</span>
            <span>Live Render Output</span>
          </div>

          <div className="playground-grid">
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>
              <div className="pane-header">DSL Editor</div>
              <textarea
                className="code-textarea"
                style={{ flex: 1, padding: '1rem', height: '100%' }}
                value={heroCode}
                onChange={(e) => setHeroCode(e.target.value)}
                spellCheck="false"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
              <div className="pane-header">Live Canvas</div>
              <div style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {heroDiagram.svg ? (
                  <div
                    style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: heroDiagram.svg }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-secondary)' }}>Rendering preview...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Engine Features</h2>
          <p className="section-subtitle">Designed for developers, software architects, and technical writers.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-heading">Zero Dependencies</h3>
            <p className="feature-desc">
              Independent <code>@flownix/engine</code> package containing tokenizer, AST parser, layout generator, and vector renderer.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3 className="feature-heading">Rich Node Shapes</h3>
            <p className="feature-desc">
              Full support for decision diamonds (<code>{`{}`}</code>), circle nodes (<code>{`(())`}</code>), rounded rects (<code>{`()`}</code>), and labeled arrows.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-heading">Interactive Canvas</h3>
            <p className="feature-desc">
              Smooth drag panning, zoom controls, fit-to-screen scaling, and interactive node click inspection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🖼️</div>
            <h3 className="feature-heading">Instant Export</h3>
            <p className="feature-desc">
              Export diagrams in one click as crisp SVG vector markup or 2x high-resolution PNG image files.
            </p>
          </div>
        </div>
      </section>

      {/* Presets Showcase Section */}
      <section className="presets-section">
        <div className="section-header">
          <h2 className="section-title">Diagram Templates</h2>
          <p className="section-subtitle">Click any template below to load it directly into the Studio editor.</p>
        </div>

        <div className="presets-grid">
          <div
            className="preset-card"
            onClick={() => onSelectPreset(`flowchart TD\n\nA((Start)) --> B[Login]\nB --> C{Valid Credentials?}\nC -->|Yes| D[Dashboard]\nC -->|No| E(Show Error)`)}
          >
            <div>
              <span className="badge" style={{ marginBottom: '8px', display: 'inline-block' }}>Flowchart TD</span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>User Authentication Pipeline</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Features decision diamond validation, arrow labels, and rounded error nodes.
              </p>
            </div>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
              Load Template ⚡
            </button>
          </div>

          <div
            className="preset-card"
            onClick={() => onSelectPreset(`flowchart LR\n\nA[Client App] --> B{Cache Hit?}\nB -->|Yes| C[Return Fast Response]\nB -->|No| D[Query Database]\nD --> E[Update Redis Cache]\nE --> C`)}
          >
            <div>
              <span className="badge" style={{ marginBottom: '8px', display: 'inline-block' }}>Flowchart LR</span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Microservice Cache Architecture</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Horizontal left-to-right diagram showcasing database and cache query paths.
              </p>
            </div>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
              Load Template ⚡
            </button>
          </div>

          <div
            className="preset-card"
            onClick={() => onSelectPreset(`flowchart TD\n\nA((Circle Node)) --> B[Rectangle Node]\nB --> C(Rounded Rectangle)\nC --> D{Decision Diamond?}`)}
          >
            <div>
              <span className="badge" style={{ marginBottom: '8px', display: 'inline-block' }}>Shapes Showcase</span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Custom Node Geometry Showcase</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Demonstrates all supported node shapes rendered by the custom SVG engine.
              </p>
            </div>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
              Load Template ⚡
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Flownix Engine v1.0.0</strong> — Released under the MIT License.
          </div>
          <div>
            Built with React, Vite & Node.js by <a href="https://github.com/rohanhalaj18" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>Rohan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

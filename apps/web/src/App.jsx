import React, { useState, useEffect } from 'react';
import { createDiagram } from '@flownix/engine';
import { Navbar } from './components/Navbar';
import { Editor } from './components/Editor';
import { DiagramCanvas } from './components/DiagramCanvas';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { SaveModal } from './components/SaveModal';
import { DashboardModal } from './components/DashboardModal';
import { ShareModal } from './components/ShareModal';
import { authAPI, diagramAPI, setAuthToken } from './services/apiClient';

const DEFAULT_DSL = `flowchart TD

A((Start)) --> B[Login]
B --> C{Valid Credentials?}
C -->|Yes| D[Dashboard]
C -->|No| E(Show Error)`;

export function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'studio'
  const [code, setCode] = useState(DEFAULT_DSL);
  const [theme, setTheme] = useState('dark');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [diagramResult, setDiagramResult] = useState(() => 
    createDiagram(DEFAULT_DSL, { theme: 'dark', selectedNodeId: null })
  );

  // Auth & Diagram State
  const [user, setUser] = useState(null);
  const [currentDiagram, setCurrentDiagram] = useState(null);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeShareId, setActiveShareId] = useState(null);

  // Check initial user authentication session
  useEffect(() => {
    authAPI
      .getMe()
      .then((res) => {
        if (res.user) setUser(res.user);
      })
      .catch(() => {
        setAuthToken(null);
      });
  }, []);

  // Check shared URL hashtag: #share=shareId
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      const shareId = hash.replace('#share=', '');
      diagramAPI
        .getShared(shareId)
        .then((res) => {
          if (res.diagram && res.diagram.sourceCode) {
            setCode(res.diagram.sourceCode);
            setCurrentDiagram(res.diagram);
            setActiveShareId(res.diagram.shareId);
            setViewMode('studio');
          }
        })
        .catch((err) => {
          console.warn('Could not load shared diagram:', err.message);
        });
    }
  }, []);

  // Debounced parsing
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const result = createDiagram(code, { theme, selectedNodeId });
        setDiagramResult(result);
      } catch (err) {
        setDiagramResult({
          errors: [{ message: `Engine runtime error: ${err.message}` }],
          svg: null,
          layout: null
        });
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [code, theme, selectedNodeId]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setCurrentDiagram(null);
  };

  const handlePresetSelect = (presetCode) => {
    setCode(presetCode);
    setSelectedNodeId(null);
    setCurrentDiagram(null);
    setViewMode('studio');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        svgContent={diagramResult.svg}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenSave={() => {
          if (!user) {
            setAuthOpen(true);
          } else {
            setSaveOpen(true);
          }
        }}
        onOpenDashboard={() => {
          if (!user) {
            setAuthOpen(true);
          } else {
            setDashboardOpen(true);
          }
        }}
        onOpenShare={() => {
          if (currentDiagram?.shareId) {
            setActiveShareId(currentDiagram.shareId);
            setShareOpen(true);
          } else if (user) {
            setSaveOpen(true);
          } else {
            setAuthOpen(true);
          }
        }}
        onLogout={handleLogout}
      />

      {viewMode === 'landing' ? (
        <LandingPage
          theme={theme}
          onOpenStudio={() => setViewMode('studio')}
          onSelectPreset={handlePresetSelect}
        />
      ) : (
        <div className="main-container">
          <Editor
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
            }}
            errors={diagramResult.errors}
          />
          <DiagramCanvas
            svgContent={diagramResult.svg}
            layoutBounds={diagramResult.layout?.bounds}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)}
      />

      <SaveModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        sourceCode={code}
        currentDiagram={currentDiagram}
        onSaveSuccess={(savedDiagram) => {
          setCurrentDiagram(savedDiagram);
          setActiveShareId(savedDiagram.shareId);
          setShareOpen(true);
        }}
      />

      <DashboardModal
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        onLoadDiagram={(diagram) => {
          setCode(diagram.sourceCode);
          setCurrentDiagram(diagram);
          setActiveShareId(diagram.shareId);
          setViewMode('studio');
        }}
        onOpenShare={(shareId) => {
          setActiveShareId(shareId);
          setShareOpen(true);
        }}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareId={activeShareId}
      />
    </div>
  );
}

export default App;

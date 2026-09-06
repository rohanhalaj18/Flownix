import React, { useState, useEffect } from 'react';
import { createDiagram } from '@flownix/engine';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { DiagramCanvas } from './components/DiagramCanvas';

const DEFAULT_DSL = `flowchart TD

A((Start)) --> B[Login]
B --> C{Valid Credentials?}
C -->|Yes| D[Dashboard]
C -->|No| E(Show Error)`;

export function App() {
  const [code, setCode] = useState(DEFAULT_DSL);
  const [theme, setTheme] = useState('dark');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [diagramResult, setDiagramResult] = useState(() => 
    createDiagram(DEFAULT_DSL, { theme: 'dark', selectedNodeId: null })
  );

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectPreset={(presetCode) => {
          setCode(presetCode);
          setSelectedNodeId(null);
        }}
        svgContent={diagramResult.svg}
        hasError={diagramResult.errors && diagramResult.errors.length > 0}
      />

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
    </div>
  );
}

export default App;

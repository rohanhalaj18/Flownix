import React, { useState, useEffect } from 'react';
import { createDiagram } from '@flownix/engine';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { DiagramCanvas } from './components/DiagramCanvas';

const DEFAULT_DSL = `flowchart TD

A[Start] --> B[End]`;

export function App() {
  const [code, setCode] = useState(DEFAULT_DSL);
  const [theme, setTheme] = useState('dark');
  const [diagramResult, setDiagramResult] = useState(() => createDiagram(DEFAULT_DSL, { theme: 'dark' }));

  // Debounce diagram updates by ~200ms
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const result = createDiagram(code, { theme });
        setDiagramResult(result);
      } catch (err) {
        setDiagramResult({
          errors: [{ message: `Engine runtime error: ${err.message}` }],
          svg: null
        });
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [code, theme]);

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
        onSelectPreset={(presetCode) => setCode(presetCode)}
        hasError={diagramResult.errors && diagramResult.errors.length > 0}
      />

      <div className="main-container">
        <Editor
          value={code}
          onChange={setCode}
          errors={diagramResult.errors}
        />
        <DiagramCanvas
          svgContent={diagramResult.svg}
        />
      </div>
    </div>
  );
}

export default App;

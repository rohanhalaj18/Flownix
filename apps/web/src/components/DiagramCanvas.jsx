import React, { useState } from 'react';

export function DiagramCanvas({ svgContent }) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.15));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="canvas-pane">
      <div className="pane-header">
        <span>SVG Canvas Preview</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>

      <div className="canvas-wrapper">
        {svgContent ? (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            Enter valid diagram syntax to render canvas.
          </div>
        )}
      </div>

      <div className="canvas-controls">
        <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">-</button>
        <button className="control-btn" onClick={handleResetZoom} title="Reset Zoom">100%</button>
        <button className="control-btn" onClick={handleZoomIn} title="Zoom In">+</button>
      </div>
    </div>
  );
}

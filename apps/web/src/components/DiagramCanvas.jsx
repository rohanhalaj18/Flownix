import React, { useState, useRef } from 'react';

export function DiagramCanvas({ svgContent, layoutBounds, selectedNodeId, onSelectNode }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.3, prev - 0.15));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitScreen = () => {
    if (!layoutBounds || !containerRef.current) return;
    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    const diagramW = layoutBounds.width || 600;
    const diagramH = layoutBounds.height || 400;

    const scaleX = (containerW - 80) / diagramW;
    const scaleY = (containerH - 80) / diagramH;
    const optimalScale = Math.min(1.5, Math.max(0.4, Math.min(scaleX, scaleY)));

    setZoom(optimalScale);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    // If clicking on a node, don't initiate canvas pan drag
    const nodeEl = e.target.closest('[data-node-id]');
    if (nodeEl) {
      const nodeId = nodeEl.getAttribute('data-node-id');
      if (onSelectNode) onSelectNode(nodeId);
      return;
    }

    // Deselect if clicking canvas background
    if (onSelectNode) onSelectNode(null);

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => Math.min(3, Math.max(0.3, prev + delta)));
  };

  return (
    <div className="canvas-pane">
      <div className="pane-header">
        <span>SVG Canvas Preview</span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {selectedNodeId && (
            <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
              Selected Node: {selectedNodeId}
            </span>
          )}
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div
        className="canvas-wrapper"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        {svgContent ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
        <button className="control-btn" onClick={handleResetZoom} title="Reset View (100%)">100%</button>
        <button className="control-btn" onClick={handleFitScreen} title="Fit Entire Diagram to Screen">Fit</button>
        <button className="control-btn" onClick={handleZoomIn} title="Zoom In">+</button>
      </div>
    </div>
  );
}

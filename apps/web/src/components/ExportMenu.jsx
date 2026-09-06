import React, { useState } from 'react';

export function ExportMenu({ svgContent, filename = 'flowchart' }) {
  const [isOpen, setIsOpen] = useState(false);

  const downloadFile = (dataUrl, extension) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'svg');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setIsOpen(false);
  };

  const handleExportPNG = () => {
    if (!svgContent) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // 2x scaling for high DPI sharp PNG output
      const scale = 2;
      canvas.width = (img.width || 800) * scale;
      canvas.height = (img.height || 600) * scale;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL('image/png');
      downloadFile(pngUrl, 'png');
      URL.revokeObjectURL(url);
      setIsOpen(false);
    };

    img.src = url;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
        Export ▾
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 100,
            minWidth: '140px',
            padding: '4px 0',
            overflow: 'hidden'
          }}
        >
          <button
            style={{
              width: '100%',
              padding: '8px 16px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleExportSVG}
          >
            📄 Export SVG
          </button>
          <button
            style={{
              width: '100%',
              padding: '8px 16px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleExportPNG}
          >
            🖼️ Export PNG
          </button>
        </div>
      )}
    </div>
  );
}

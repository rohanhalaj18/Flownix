import React, { useState, useEffect } from 'react';
import { diagramAPI } from '../services/apiClient';

export function DashboardModal({ isOpen, onClose, onLoadDiagram, onOpenShare }) {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDiagrams();
    }
  }, [isOpen]);

  const fetchDiagrams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await diagramAPI.list();
      setDiagrams(res.diagrams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this diagram?')) return;
    try {
      await diagramAPI.delete(id);
      setDiagrams(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>My Saved Diagrams</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading your diagrams...
          </div>
        ) : error ? (
          <div className="error-banner" style={{ margin: '1rem 0' }}>
            {error}
          </div>
        ) : diagrams.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No saved diagrams found. Click "Save" in the toolbar to persist your flowcharts!
          </div>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {diagrams.map(item => (
              <div
                key={item._id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onClick={() => {
                  onLoadDiagram(item);
                  onClose();
                }}
              >
                <div>
                  <h4 style={{ color: 'var(--accent-color)', marginBottom: '4px', fontSize: '1rem' }}>
                    {item.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {item.description || 'No description provided'}
                  </p>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.8 }}>
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {item.isPublic && (
                    <button
                      className="btn"
                      style={{ fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenShare) onOpenShare(item.shareId);
                      }}
                    >
                      🔗 Share
                    </button>
                  )}
                  <button
                    className="btn"
                    style={{ fontSize: '0.75rem', borderColor: 'var(--error-border)', color: 'var(--error-text)' }}
                    onClick={(e) => handleDelete(item._id, e)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

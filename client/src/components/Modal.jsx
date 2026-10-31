import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '550px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 13, 11, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '28px',
          backgroundColor: '#17201b',
          border: '1px solid rgba(164, 203, 179, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 id="modal-title" style={{ fontSize: '1.4rem', color: '#F1F1EB' }}>{title}</h2>
          <button 
            onClick={onClose} 
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '50%' }}
            aria-label="Cerrar ventana emergente"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

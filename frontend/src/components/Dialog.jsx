import React from 'react';
import './Dialog.css';

const Dialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="dialog-content">
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button 
            className="dialog-btn dialog-btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="dialog-btn dialog-btn-primary" 
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog; 
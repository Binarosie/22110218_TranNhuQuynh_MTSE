import React from "react";
import { Button } from "./Button";

/**
 * Modal component
 * @param {Object} props
 * @param {boolean} props.open - Modal state
 * @param {string} props.title - Modal title
 * @param {function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 */
export const Modal = ({ open, title, onClose, children, ...props }) => {
  if (!open) return null;

  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div
        className="bm-modal"
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="bm-modal__header">
          {title && <h2 className="bm-modal__title">{title}</h2>}
          <button className="bm-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="bm-modal__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

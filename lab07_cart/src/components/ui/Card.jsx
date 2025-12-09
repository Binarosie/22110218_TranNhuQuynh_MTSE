import React from "react";

/**
 * Card component với title, actions, footer
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.actions - Action buttons
 * @param {React.ReactNode} props.footer - Card footer
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Custom class
 */
export const Card = ({
  title,
  actions,
  footer,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`bm-card ${className}`} {...props}>
      {(title || actions) && (
        <div className="bm-card__header">
          {title && <h3 className="bm-card__title">{title}</h3>}
          {actions && <div className="bm-card__actions">{actions}</div>}
        </div>
      )}
      <div className="bm-card__body">{children}</div>
      {footer && <div className="bm-card__footer">{footer}</div>}
    </div>
  );
};

export default Card;

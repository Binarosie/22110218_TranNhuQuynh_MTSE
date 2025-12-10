import React from "react";

/**
 * Button component với variants: primary, secondary, danger, ghost
 * @param {Object} props
 * @param {string} props.variant - primary | secondary | danger | ghost
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Custom class
 * @param {React.ReactNode} props.children - Button content
 */
export const Button = ({
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  onClick,
  ...props
}) => {
  const baseClass = "bm-btn";
  const variantClass = `bm-btn--${variant}`;
  const loadingClass = loading ? "bm-btn--loading" : "";
  const disabledClass = disabled || loading ? "bm-btn--disabled" : "";

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      console.log('🔘 Button onClick triggered');
      onClick(e);
    }
  };

  return (
    <button
      className={`${baseClass} ${variantClass} ${loadingClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <span className="bm-btn__spinner"></span>}
      <span className="bm-btn__content">{children}</span>
    </button>
  );
};

export default Button;

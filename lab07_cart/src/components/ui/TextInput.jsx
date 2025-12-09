import React from "react";

/**
 * TextInput component với label, error, disabled states
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Custom class
 */
export const TextInput = ({
  label,
  error,
  disabled = false,
  className = "",
  ...props
}) => {
  const inputClass = `bm-input ${error ? "bm-input--error" : ""} ${
    disabled ? "bm-input--disabled" : ""
  } ${className}`;

  return (
    <div className="bm-input-group">
      {label && <label className="bm-input__label">{label}</label>}
      <input className={inputClass} disabled={disabled} {...props} />
      {error && <span className="bm-input__error">{error}</span>}
    </div>
  );
};

export default TextInput;

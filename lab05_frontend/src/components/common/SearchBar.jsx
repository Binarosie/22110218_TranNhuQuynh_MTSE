import React from 'react';
import useDebounce from '../../hooks/useDebounce';

/**
 * SearchBar Component
 * @param {object} props - Component props
 * @param {string} props.value - Search input value
 * @param {function} props.onChange - Change handler (receives debounced value)
 * @param {string} props.placeholder - Input placeholder
 * @param {number} props.delay - Debounce delay in ms (default 500)
 */
const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Tìm kiếm...', 
  delay = 500 
}) => {
  const [inputValue, setInputValue] = React.useState(value || '');
  const debouncedValue = useDebounce(inputValue, delay);

  // Update parent component when debounced value changes
  React.useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  // Sync with external value changes
  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;

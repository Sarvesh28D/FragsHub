/**
 * Button Click Handler Utilities for FragsHub
 * 
 * These utilities help ensure consistent button behavior across the application
 */

/**
 * Creates a standardized button click handler with logging and preventDefault
 * @param {Function} handler - The function to execute on click
 * @param {string} buttonName - Name of the button for logging
 * @param {boolean} preventDefault - Whether to prevent default behavior
 * @returns {Function} Enhanced click handler
 */
export const createButtonHandler = (handler, buttonName, preventDefault = true) => {
  return (e) => {
    if (preventDefault) {
      e.preventDefault();
    }
    
    console.log(`Button clicked: ${buttonName}`, {
      timestamp: new Date().toISOString(),
      event: e.type,
      target: e.target.tagName
    });
    
    // Call the original handler
    if (typeof handler === 'function') {
      handler(e);
    }
  };
};

/**
 * Creates a keyboard event handler for accessibility
 * @param {Function} clickHandler - The click handler to trigger
 * @param {string} buttonName - Name of the button for logging
 * @returns {Function} Keyboard event handler
 */
export const createKeyboardHandler = (clickHandler, buttonName) => {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log(`Button activated via keyboard: ${buttonName}`, {
        key: e.key,
        timestamp: new Date().toISOString()
      });
      clickHandler(e);
    }
  };
};

/**
 * Standard button class names with focus and accessibility styles
 */
export const buttonStyles = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500',
  success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-white/10 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50',
};

/**
 * Mobile-optimized button styles with larger touch targets
 */
export const mobileButtonStyles = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 min-h-[44px]',
};

/**
 * Button component with enhanced accessibility and logging
 */
export const EnhancedButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  name = 'Unknown Button',
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const handleClick = createButtonHandler(onClick, name);
  const handleKeyDown = createKeyboardHandler(handleClick, name);
  
  return (
    <button
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`${buttonStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={name}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Modal backdrop handler that prevents event bubbling
 */
export const createModalBackdropHandler = (closeHandler, modalName) => {
  return (e) => {
    e.stopPropagation();
    console.log(`Modal backdrop clicked: ${modalName}`);
    closeHandler();
  };
};

/**
 * Form submission handler with validation logging
 */
export const createFormHandler = (submitHandler, formName) => {
  return (e) => {
    e.preventDefault();
    console.log(`Form submitted: ${formName}`, {
      timestamp: new Date().toISOString(),
      formData: new FormData(e.target)
    });
    submitHandler(e);
  };
};

/**
 * Debounced click handler to prevent rapid clicking
 */
export const createDebouncedHandler = (handler, name, delay = 300) => {
  let timeoutId;
  
  return (e) => {
    e.preventDefault();
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      console.log(`Debounced button clicked: ${name}`);
      handler(e);
    }, delay);
  };
};

/**
 * Loading state handler for async operations
 */
export const createAsyncButtonHandler = (asyncHandler, name, setLoading) => {
  return async (e) => {
    e.preventDefault();
    
    if (setLoading) setLoading(true);
    
    try {
      console.log(`Async button clicked: ${name} - Starting`);
      await asyncHandler(e);
      console.log(`Async button clicked: ${name} - Completed`);
    } catch (error) {
      console.error(`Async button clicked: ${name} - Error:`, error);
    } finally {
      if (setLoading) setLoading(false);
    }
  };
};

export default {
  createButtonHandler,
  createKeyboardHandler,
  createModalBackdropHandler,
  createFormHandler,
  createDebouncedHandler,
  createAsyncButtonHandler,
  buttonStyles,
  mobileButtonStyles,
  EnhancedButton
};

// FocusContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const FocusContext = createContext();

export const FocusProvider = ({ children }) => {
  // area: 'sidebar', 'content', 'header'
  // index: the item index within that area
  const [focusState, setFocusState] = useState({ area: 'content', index: 0 });

  const handleKeyDown = useCallback((e) => {
    const { area, index } = focusState;

    switch (e.keyCode || e.key) {
      case 39: // Right
        if (area === 'content') {
          setFocusState(prev => ({ ...prev, index: prev.index + 1 }));
        } else if (area === 'sidebar') {
          setFocusState({ area: 'content', index: 0 }); // Move from sidebar to content
        }
        break;

      case 37: // Left
        if (area === 'content' && index === 0) {
          setFocusState({ area: 'sidebar', index: 0 }); // Move from content to sidebar
        } else if (area === 'content') {
          setFocusState(prev => ({ ...prev, index: prev.index - 1 }));
        }
        break;

      case 10009: // Back
        // Handle global back logic, like showing an exit modal
        break;
      
      default:
        break;
    }
  }, [focusState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <FocusContext.Provider value={{ focusState, setFocusState }}>
      {children}
    </FocusContext.Provider>
  );
};
import { useCallback, useEffect, useRef, useState } from 'react';

interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean;
  enableFocusManagement?: boolean;
  enableScreenReader?: boolean;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
}

interface FocusTrapOptions {
  onEscape?: () => void;
  onTabOut?: () => void;
  returnFocus?: boolean;
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    enableKeyboardNavigation = true,
    enableFocusManagement = true,
    enableScreenReader = true,
    enableHighContrast = false,
    enableReducedMotion = false,
  } = options;

  const [isHighContrast, setIsHighContrast] = useState(enableHighContrast);
  const [isReducedMotion, setIsReducedMotion] = useState(enableReducedMotion);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(enableScreenReader);

  // Check user preferences
  useEffect(() => {
    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Check for screen reader (basic detection)
    const checkScreenReader = () => {
      const hasScreenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        navigator.userAgent.includes('TalkBack');
      setIsScreenReaderActive(hasScreenReader);
    };
    checkScreenReader();

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Focus management
  const focusRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (!enableFocusManagement || !element) return;
    
    previousFocusRef.current = document.activeElement as HTMLElement;
    element.focus();
    focusRef.current = element;
  }, [enableFocusManagement]);

  const returnFocus = useCallback(() => {
    if (!enableFocusManagement || !previousFocusRef.current) return;
    
    previousFocusRef.current.focus();
    previousFocusRef.current = null;
  }, [enableFocusManagement]);

  // Focus trap for modals/dialogs
  const useFocusTrap = useCallback((options: FocusTrapOptions = {}) => {
    const containerRef = useRef<HTMLElement>(null);
    const focusableElementsRef = useRef<HTMLElement[]>([]);

    const getFocusableElements = useCallback(() => {
      if (!containerRef.current) return [];
      
      return Array.from(
        containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
        )
      ).filter((el) => {
        const element = el as HTMLElement;
        return !(element as any).disabled && element.offsetParent !== null;
      }) as HTMLElement[];
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (!enableKeyboardNavigation) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      let nextIndex = currentIndex;

      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          if (event.shiftKey) {
            nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          } else {
            nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          }
          focusableElements[nextIndex]?.focus();
          break;

        case 'Escape':
          if (options.onEscape) {
            options.onEscape();
          }
          break;

        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          if (event.key === 'ArrowUp') {
            nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          } else {
            nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          }
          focusableElements[nextIndex]?.focus();
          break;
      }
    }, [enableKeyboardNavigation, getFocusableElements, options.onEscape]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener('keydown', handleKeyDown);
      
      // Store initial focus
      if (options.returnFocus) {
        previousFocusRef.current = document.activeElement as HTMLElement;
      }

      // Focus first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        
        // Return focus when unmounting
        if (options.returnFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }, [handleKeyDown, getFocusableElements, options.returnFocus]);

    return containerRef;
  }, [enableKeyboardNavigation]);

  // ARIA utilities
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReader || !isScreenReaderActive) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [enableScreenReader, isScreenReaderActive]);

  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    if (!enableScreenReader) return;
    element.setAttribute('aria-label', label);
  }, [enableScreenReader]);

  const setAriaDescribedBy = useCallback((element: HTMLElement, descriptionId: string) => {
    if (!enableScreenReader) return;
    element.setAttribute('aria-describedby', descriptionId);
  }, [enableScreenReader]);

  const setAriaExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    if (!enableScreenReader) return;
    element.setAttribute('aria-expanded', expanded.toString());
  }, [enableScreenReader]);

  const setAriaHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    if (!enableScreenReader) return;
    element.setAttribute('aria-hidden', hidden.toString());
  }, [enableScreenReader]);

  // Keyboard navigation utilities
  const handleEnterKey = useCallback((callback: () => void) => {
    return (event: React.KeyboardEvent) => {
      if (!enableKeyboardNavigation) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
      }
    };
  }, [enableKeyboardNavigation]);

  const handleArrowKeys = useCallback((
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void
  ) => {
    return (event: React.KeyboardEvent) => {
      if (!enableKeyboardNavigation) return;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onDown?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onRight?.();
          break;
      }
    };
  }, [enableKeyboardNavigation]);

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, label: string = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    return skipLink;
  }, []);

  // High contrast utilities
  const applyHighContrast = useCallback((element: HTMLElement) => {
    if (!isHighContrast) return;
    
    element.style.filter = 'contrast(150%) brightness(120%)';
    element.style.border = '2px solid #000';
  }, [isHighContrast]);

  const removeHighContrast = useCallback((element: HTMLElement) => {
    element.style.filter = '';
    element.style.border = '';
  }, []);

  // Reduced motion utilities
  const shouldReduceMotion = useCallback(() => {
    return isReducedMotion;
  }, [isReducedMotion]);

  const getAnimationDuration = useCallback((defaultDuration: number) => {
    return isReducedMotion ? 0 : defaultDuration;
  }, [isReducedMotion]);

  // Form accessibility
  const markFieldAsRequired = useCallback((element: HTMLElement, required: boolean = true) => {
    if (!enableScreenReader) return;
    
    element.setAttribute('aria-required', required.toString());
    if (required) {
      element.setAttribute('required', '');
    } else {
      element.removeAttribute('required');
    }
  }, [enableScreenReader]);

  const markFieldAsInvalid = useCallback((element: HTMLElement, invalid: boolean, message?: string) => {
    if (!enableScreenReader) return;
    
    element.setAttribute('aria-invalid', invalid.toString());
    if (invalid && message) {
      element.setAttribute('aria-errormessage', message);
    } else {
      element.removeAttribute('aria-errormessage');
    }
  }, [enableScreenReader]);

  // List accessibility
  const createAccessibleList = useCallback((
    container: HTMLElement,
    items: HTMLElement[],
    listType: 'list' | 'tree' | 'tablist' = 'list'
  ) => {
    if (!enableScreenReader) return;

    const role = listType === 'list' ? 'list' : listType === 'tree' ? 'tree' : 'tablist';
    container.setAttribute('role', role);
    
    items.forEach((item, index) => {
      const itemRole = listType === 'list' ? 'listitem' : listType === 'tree' ? 'treeitem' : 'tab';
      item.setAttribute('role', itemRole);
      item.setAttribute('aria-setsize', items.length.toString());
      item.setAttribute('aria-posinset', (index + 1).toString());
    });
  }, [enableScreenReader]);

  return {
    // State
    isHighContrast,
    isReducedMotion,
    isScreenReaderActive,
    
    // Focus management
    focusElement,
    returnFocus,
    useFocusTrap,
    
    // Screen reader
    announceToScreenReader,
    
    // ARIA utilities
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaHidden,
    
    // Keyboard navigation
    handleEnterKey,
    handleArrowKeys,
    
    // Skip links
    createSkipLink,
    
    // High contrast
    applyHighContrast,
    removeHighContrast,
    
    // Reduced motion
    shouldReduceMotion,
    getAnimationDuration,
    
    // Form accessibility
    markFieldAsRequired,
    markFieldAsInvalid,
    
    // List accessibility
    createAccessibleList,
  };
}

// Hook for component-specific accessibility
export function useComponentAccessibility(componentName: string, options?: AccessibilityOptions) {
  const accessibility = useAccessibility(options);

  return {
    ...accessibility,
    // Component-specific ARIA labels
    setComponentAriaLabel: (element: HTMLElement, label: string) => {
      accessibility.setAriaLabel(element, `${componentName}: ${label}`);
    },
    
    // Component-specific announcements
    announceComponentAction: (action: string) => {
      accessibility.announceToScreenReader(`${componentName} ${action}`);
    },
  };
}

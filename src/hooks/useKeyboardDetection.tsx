import { useState, useEffect } from "react";

export const useKeyboardDetection = () => {
  const [isVirtualKeyboard, setIsVirtualKeyboard] = useState(false);

  useEffect(() => {
    // iOS detection without using deprecated navigator.platform
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      // For iPad detection on newer iPadOS that reports as "MacIntel"
      (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));

    // Initial detection
    const detectInitialKeyboardType = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

      return isMobile || (isTouchDevice && hasCoarsePointer);
    };

    setIsVirtualKeyboard(detectInitialKeyboardType());

    // Dynamic detection based on viewport changes
    const initialViewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    // iOS-specific threshold calculation
    const windowHeight = window.innerHeight;
    const isLandscape = window.innerWidth > window.innerHeight;
    const iosKeyboardThreshold = isLandscape
      ? 0.3 * windowHeight
      : 0.4 * windowHeight;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialViewportHeight - currentHeight;

        if (isIOS) {
          // iOS uses percentage-based detection
          const heightChangePercent = heightDifference / initialViewportHeight;
          if (
            heightChangePercent > 0.15 ||
            heightDifference > iosKeyboardThreshold
          ) {
            setIsVirtualKeyboard(true);
          } else if (heightChangePercent < 0.05) {
            setIsVirtualKeyboard(detectInitialKeyboardType());
          }
        } else {
          // Non-iOS detection (unchanged)
          if (heightDifference > 150) {
            setIsVirtualKeyboard(true);
          } else if (heightDifference < 50) {
            setIsVirtualKeyboard(detectInitialKeyboardType());
          }
        }
      }
    };

    // Input focus/blur detection (critical for iOS)
    const inputFocusHandler = (e: FocusEvent) => {
      if (
        isIOS &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement)
      ) {
        // iOS keyboard takes time to appear
        setTimeout(() => {
          if (document.activeElement === e.target) {
            setIsVirtualKeyboard(true);
          }
        }, 100);
      }
    };

    const inputBlurHandler = () => {
      if (isIOS) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (
            !(
              activeElement instanceof HTMLInputElement ||
              activeElement instanceof HTMLTextAreaElement
            )
          ) {
            setIsVirtualKeyboard(detectInitialKeyboardType());
          }
        }, 100);
      }
    };

    // Listen for visual viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
    }

    // Fallback for older browsers
    const resizeHandler = () => {
      setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;

        if (isIOS) {
          const heightChangePercent = heightDifference / initialViewportHeight;
          if (
            heightChangePercent > 0.15 ||
            heightDifference > iosKeyboardThreshold
          ) {
            setIsVirtualKeyboard(true);
          }
        } else if (heightDifference > 150) {
          setIsVirtualKeyboard(true);
        }
      }, 300);
    };

    // Add all event listeners
    window.addEventListener("resize", resizeHandler);
    document.addEventListener("focus", inputFocusHandler, true);
    document.addEventListener("blur", inputBlurHandler, true);

    const touchHandler = () => {
      if (window.matchMedia("(pointer: coarse)").matches) {
        setIsVirtualKeyboard(true);
      }
    };
    document.addEventListener("touchstart", touchHandler, { once: true });

    const keydownHandler = (e: KeyboardEvent) => {
      if (!isIOS && e.key && e.isTrusted !== false) {
        setIsVirtualKeyboard(false);
      } else if (isIOS) {
        // For iOS, only detect physical keyboard with modifier keys
        if (
          (e.key === "Tab" && e.shiftKey) ||
          e.ctrlKey ||
          e.metaKey ||
          e.altKey
        ) {
          setIsVirtualKeyboard(false);
        }
      }
    };
    document.addEventListener("keydown", keydownHandler);

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange,
        );
      }
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("focus", inputFocusHandler, true);
      document.removeEventListener("blur", inputBlurHandler, true);
      document.removeEventListener("touchstart", touchHandler);
      document.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  return isVirtualKeyboard;
};

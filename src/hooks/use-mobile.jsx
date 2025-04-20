import { useState, useEffect } from 'react';

/**
 * Hook to check if the current viewport is mobile
 * @returns {boolean} True if viewport is mobile
 */
export function useIsMobile() {
  // Start with a default based on current width
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    // Handler to update state
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away to set initial value
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means this only runs on mount/unmount

  return isMobile;
}
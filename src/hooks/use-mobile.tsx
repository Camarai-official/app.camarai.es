
import * as React from "react"

const TABLET_BREAKPOINT = 1024;
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false); 

  React.useEffect(() => {
    setIsMounted(true); 

    const mobileMql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const tabletMql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(mobileMql.matches);
      setIsTablet(tabletMql.matches);
    };
    
    onChange(); // Set initial value
    mobileMql.addEventListener("change", onChange);
    tabletMql.addEventListener("change", onChange);

    return () => {
        mobileMql.removeEventListener("change", onChange);
        tabletMql.removeEventListener("change", onChange);
    }
  }, []);

  return { 
    isMobile: isMounted ? isMobile : false, 
    isTablet: isMounted ? isTablet : false,
  };
}

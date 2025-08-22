
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export function useMobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fermer le menu lors du changement de route sur mobile
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      const handleRouteChange = () => setIsMenuOpen(false);
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, [isMobile, isMenuOpen]);

  // Fermer le menu si on passe en desktop
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isMobile
  };
}

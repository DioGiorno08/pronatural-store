import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Barra superior luminosa de progreso de navegación.
 * Aparece en la parte superior de la pantalla en cada cambio de ruta
 * dando feedback visual instantáneo del cambio de página.
 */
export default function RouteProgressBar() {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => {
      setActive(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3.5px] bg-transparent pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-[#30b466] via-[#75e29f] to-[#30b466] shadow-[0_0_14px_rgba(48,180,102,0.8)] animate-route-progress" 
      />
    </div>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que restablece la posición de desplazamiento al inicio de la ventana
 * cada vez que cambia la ruta en la aplicación.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

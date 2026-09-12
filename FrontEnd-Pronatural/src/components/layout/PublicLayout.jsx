// Layout público de la tienda de clientes
// Envuelve todas las páginas públicas con el navbar y el footer
import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import Footer from './Footer';
import PageTransition from '../common/PageTransition';

export default function PublicLayout() {
  return (
    // Contenedor principal con altura mínima de pantalla completa
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col">
      {/* Barra de navegación superior */}
      <TopNavbar />

      {/* Contenido de la página actual envuelto en transición de salida y entrada cinemática */}
      <main className="flex-1 w-full bg-brand-bg">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}

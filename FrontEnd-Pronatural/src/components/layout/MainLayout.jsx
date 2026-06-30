import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg font-sans overflow-hidden">
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ${isLanding ? '' : 'px-4 md:px-14'}`}>
          <div className={isLanding ? 'px-4 md:px-14 pt-4' : 'pt-4'}>
            <Header toggleSidebar={() => setIsSidebarOpen(true)} />
          </div>
          <main className={`flex-1 ${isLanding ? '' : 'pb-24 pt-4'}`}>
            <Outlet />
          </main>
        </div>
      </div>
      <footer className="bg-brand-dark text-white py-14 px-12 flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter mb-2 flex items-center">
            <span className="mr-0.5">PRO</span>NATURAL
          </h2>
          <p className="text-[8px] text-gray-400 uppercase tracking-[0.15em] opacity-60">© 2026 ARCHIVO TÉCNICO. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
        <div className="flex gap-10 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 opacity-60">
          <Link to="#" className="hover:text-white transition-colors">PRIVACY</Link>
          <Link to="#" className="hover:text-white transition-colors">TERMS</Link>
          <Link to="#" className="hover:text-white transition-colors">SHIPPING</Link>
        </div>
      </footer>
    </div>
  );
}

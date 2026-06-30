import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function TopNavbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${
      isActive ? 'text-orange-700 border-b-2 border-orange-700 pb-1' : 'text-brand-dark hover:text-gray-500'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block text-[11px] font-bold tracking-[0.2em] uppercase py-4 border-b border-gray-100 transition-colors ${
      isActive ? 'text-orange-700' : 'text-brand-dark'
    }`;

  return (
    <>
      <header className="flex items-center justify-between py-5 px-5 md:px-12 bg-brand-bg sticky top-0 z-50 border-b border-gray-100">
        {/* Logo */}
        <Link to="/" className="text-[20px] md:text-[22px] font-bold tracking-tighter text-brand-dark">
          PRONATURAL
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-12">
          <NavLink to="/" end className={navLinkClass}>INICIO</NavLink>
          <NavLink to="/acerca" className={navLinkClass}>ACERCA DE</NavLink>
          <NavLink to="/resenas" className={navLinkClass}>RESEÑAS</NavLink>
          <NavLink to="/contacto" className={navLinkClass}>CONTACTO</NavLink>
        </nav>

        {/* Right: Cart + Profile + Hamburger */}
        <div className="flex items-center gap-5">
          {/* Carrito */}
          <Link to="/carrito" className="relative text-brand-dark hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#b45309] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Perfil (solo desktop) */}
          <Link
            to="/perfil"
            className="text-[9px] font-bold tracking-[0.15em] text-gray-400 hover:text-brand-dark uppercase transition-colors hidden md:block"
          >
            PERFIL
          </Link>

          {/* Hamburguesa (solo móvil) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-1 text-brand-dark"
            aria-label="Abrir menú"
          >
            <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden fixed top-[61px] left-0 right-0 z-40 bg-brand-bg border-b border-gray-100 overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="px-5 pb-2">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>INICIO</NavLink>
          <NavLink to="/acerca" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>ACERCA DE</NavLink>
          <NavLink to="/resenas" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>RESEÑAS</NavLink>
          <NavLink to="/contacto" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>CONTACTO</NavLink>
          <NavLink to="/perfil" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>PERFIL</NavLink>
        </nav>
      </div>
    </>
  );
}

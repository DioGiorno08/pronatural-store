import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
export default function TopNavbar() {
  const { totalItems } = useCart();
  const { logout } = useAuth();
  const navLinkClass = ({ isActive }) =>
    `text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${
      isActive ? 'text-orange-700 border-b-2 border-orange-700 pb-1' : 'text-brand-dark hover:text-gray-500'
    }`;
  return (
    <header className="flex items-center justify-between py-6 px-6 md:px-12 bg-brand-bg sticky top-0 z-50 border-b border-gray-100">
      <Link to="/" className="text-[22px] font-bold tracking-tighter text-brand-dark">
        PRONATURAL
      </Link>
      <nav className="hidden md:flex gap-12">
        <NavLink to="/" end className={navLinkClass}>INICIO</NavLink>
        <NavLink to="/acerca" className={navLinkClass}>ACERCA DE</NavLink>
        <NavLink to="/resenas" className={navLinkClass}>RESEÑAS</NavLink>
        <NavLink to="/contacto" className={navLinkClass}>CONTACTO</NavLink>
      </nav>
      <div className="flex items-center gap-6">
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
        <Link
          to="/perfil"
          className="text-[9px] font-bold tracking-[0.15em] text-gray-400 hover:text-brand-dark uppercase transition-colors hidden md:block"
        >
          PERFIL
        </Link>
      </div>
    </header>
  );
}

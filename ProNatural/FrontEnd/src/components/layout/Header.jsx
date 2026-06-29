import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
export default function Header() {
  const { totalItems } = useCart();
  return (
    <header className="flex items-center justify-between py-6 px-0 bg-brand-bg">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-brand-dark">
          PRONATURAL
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link to="/acerca" className="text-[11px] font-semibold tracking-widest text-brand-dark hover:text-gray-500 transition-colors">ACERCA DE</Link>
          <Link to="/resenas" className="text-[11px] font-semibold tracking-widest text-brand-dark hover:text-gray-500 transition-colors">RESEÑAS</Link>
          <Link to="/contacto" className="text-[11px] font-semibold tracking-widest text-brand-dark hover:text-gray-500 transition-colors">CONTACTO</Link>
        </nav>
      </div>
        <div className="flex items-center gap-4">
          <Link to="/carrito" className="relative text-brand-dark hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#154734] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/perfil" className="text-brand-dark hover:text-gray-600 transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
export default function Header({ toggleSidebar }) {
  const { totalItems } = useCart();
  return (
    <header className="flex items-center justify-between py-8 px-0 bg-brand-bg">
      <div className="flex items-center gap-4 md:gap-14">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="text-brand-dark p-2 hover:bg-black/5 rounded-lg transition-colors cursor-pointer">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter text-brand-dark flex items-center">
          <span className="mr-0.5">PRO</span>NATURAL
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-[10px] font-bold tracking-[0.15em] text-brand-dark hover:text-gray-500 transition-colors uppercase">INICIO</Link>
          <Link to="/catalogo" className="text-[10px] font-bold tracking-[0.15em] text-brand-dark hover:text-gray-500 transition-colors uppercase">CATÁLOGO</Link>
          <Link to="/acerca" className="text-[10px] font-bold tracking-[0.15em] text-brand-dark hover:text-gray-500 transition-colors uppercase">ACERCA DE</Link>
          <Link to="/contacto" className="text-[10px] font-bold tracking-[0.15em] text-brand-dark hover:text-gray-500 transition-colors uppercase">CONTACTO</Link>
        </nav>
      </div>
      <div className="flex items-center gap-10">
        <form action="/catalogo" method="get" className="hidden md:flex items-center relative group">
          <input 
            type="text" 
            name="q"
            placeholder="BUSCAR PRODUCTOS POR SU NOMBRE..." 
            className="w-80 border-b-2 border-gray-200 py-2 text-[10px] bg-transparent focus:outline-none focus:border-brand-dark transition-colors tracking-[0.15em] text-brand-dark placeholder-gray-400 font-bold uppercase"
          />
          <button type="submit" className="absolute right-0 text-gray-400 hover:text-brand-dark transition-colors p-2">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </form>
        <Link to="/carrito" className="relative text-brand-dark hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-dark text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

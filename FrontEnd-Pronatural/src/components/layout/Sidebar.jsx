import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalData } from '../../context/GlobalDataContext';
export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'Customer';
  const { categories: globalCategories } = useGlobalData();
  const categories = globalCategories.map(c => typeof c === 'string' ? c : (c.nombre || c.name)).filter(Boolean);
  const linkClass = ({ isActive }) =>
    `flex items-center text-xs font-bold tracking-widest px-4 py-3 transition-colors uppercase ${
      isActive
        ? 'text-white bg-brand-dark shadow-sm'
        : 'text-gray-500 hover:text-brand-dark'
    }`;
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-brand-sidebar z-50 transform transition-transform duration-300 ease-in-out flex flex-col py-10 px-8 border-r border-gray-200/50 justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="mb-14 flex items-center justify-between">
            <Link to="/catalogo" onClick={() => setIsOpen(false)} className="text-[28px] font-bold tracking-tight text-brand-dark uppercase">CATALOGO</Link>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-brand-dark p-2 -mr-2 cursor-pointer transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        <nav className="mb-12">
          <ul className="space-y-1">
            <li>
              <NavLink to="/catalogo" className="flex items-center text-xs font-bold tracking-widest px-5 py-4 transition-colors uppercase bg-brand-dark text-white shadow-md">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                PRODUCTOS
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="flex-1 overflow-y-auto pr-2 max-h-[400px] custom-scrollbar">
          <ul className="space-y-6">
            <li>
              <Link
                to="/catalogo"
                onClick={() => setIsOpen(false)}
                className={`text-[10px] font-bold tracking-[0.15em] transition-colors text-left w-full block uppercase ${!window.location.search || window.location.search.includes('category=TODOS') ? 'text-[#b45309]' : 'text-gray-500 hover:text-brand-dark'}`}
              >
                TODOS
              </Link>
            </li>
            {categories.map((cat, index) => {
              const isActive = window.location.search.includes(`category=${encodeURIComponent(cat)}`);
              return (
                <li key={index}>
                  <Link
                    to={`/catalogo?category=${encodeURIComponent(cat)}`}
                    onClick={() => setIsOpen(false)}
                    className={`text-[10px] font-bold tracking-[0.15em] transition-colors text-left w-full block uppercase ${isActive ? 'text-[#b45309]' : 'text-gray-500 hover:text-brand-dark'}`}
                  >
                    {cat}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-200/50 mt-auto">
        <button
          onClick={() => {
            setIsOpen(false);
            logout();
          }}
          className="w-full text-gray-400 hover:text-brand-dark text-[10px] font-bold tracking-[0.2em] uppercase py-3 transition-colors text-left cursor-pointer"
        >
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
    </>
  );
}

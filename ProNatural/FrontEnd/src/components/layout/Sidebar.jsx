import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalData } from '../../context/GlobalDataContext';
export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || 'Customer';
  const { categories: globalCategories } = useGlobalData();
  const categories = globalCategories.map(c => typeof c === 'string' ? c : c.name);
  const linkClass = ({ isActive }) =>
    `flex items-center text-xs font-bold tracking-widest px-4 py-3 transition-colors uppercase ${
      isActive
        ? 'text-white bg-brand-dark shadow-sm'
        : 'text-gray-500 hover:text-brand-dark'
    }`;
  return (
    <aside className="w-64 flex-shrink-0 bg-brand-sidebar min-h-screen flex flex-col py-8 px-6 border-r border-gray-200 justify-between">
      <div>
        <div className="mb-12">
          <Link to="/catalogo" className="text-2xl font-bold tracking-tight text-brand-dark">PRO NATURAL</Link>
        </div>
        <nav className="mb-8">
          <ul className="space-y-1">
            <li>
              <NavLink to="/catalogo" className={linkClass}>
                PRODUCTOS
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="flex-1 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
          <div className="mb-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">CATEGORÍAS</span>
          </div>
          <ul className="space-y-5">
            <li>
              <Link
                to="/catalogo"
                className="text-xs font-semibold tracking-wider transition-colors text-left w-full text-orange-700 hover:text-brand-dark block"
              >
                TODOS
              </Link>
            </li>
            {categories.map((cat, index) => (
              <li key={index}>
                <Link
                  to={`/catalogo?category=${encodeURIComponent(cat)}`}
                  className="text-xs font-semibold tracking-wider transition-colors text-left w-full text-gray-500 hover:text-brand-dark block"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-200 mt-auto">
        <button
          onClick={logout}
          className="w-full bg-[#b45309] text-white text-[9px] font-bold tracking-[0.2em] uppercase py-3 hover:bg-orange-800 transition-colors text-center cursor-pointer"
        >
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
}

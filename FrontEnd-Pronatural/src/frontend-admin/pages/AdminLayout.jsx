import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalData } from '../../context/GlobalDataContext';
import { ADMIN_PREFIX } from '../../config';
const IconLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#75e29f" />
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3L12 21Z" fill="#30b466" />
    <path d="M8 12C8 12 10.5 9 14 9C14 9 12.5 12 9 15L8 12Z" fill="#0d1f14" />
  </svg>
);
const IconDashboard = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconInventory = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>
);
const IconSales = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 4h3l2.5 13h10.5l3-9H5.5" />
    <circle cx="8" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
  </svg>
);
const IconSuppliers = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconReports = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
function AdminSidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'Admin';
  const navLink = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all font-medium ${
      isActive
        ? 'bg-[#1b4332] text-[#4ade80]'
        : 'text-gray-400 hover:text-white'
    }`;
  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      <aside className={`w-[240px] flex-shrink-0 bg-[#161b1e] border-r border-white/5 min-h-screen flex flex-col py-6 absolute md:relative z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="px-6 mb-8 flex items-center gap-3">
        <IconLogo />
        <div>
          <p className="text-[#4ade80] text-[16px] font-bold leading-none tracking-tight">Pro Natural</p>
          <p className="text-gray-500 text-[10px] mt-1 tracking-wider">Portal {role === 'Admin' ? 'Admin' : 'Vendedor'}</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {role === 'Admin' && (
          <>
            <NavLink to={ADMIN_PREFIX} end className={navLink}>
              <IconDashboard /><span>Panel Principal</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/catalogo`} className={navLink}>
              <IconInventory /><span>Catálogo</span>
            </NavLink>
            <NavLink to="/inventario" className={navLink}>
              <IconInventory /><span>Inventario</span>
            </NavLink>
            <NavLink to="/ventas/registrar" className={navLink}>
              <IconSales /><span>Nueva Venta</span>
            </NavLink>
            <NavLink to="/ventas/historial" className={navLink}>
              <IconReports /><span>Historial de Ventas</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/vendedores`} className={navLink}>
              <IconSuppliers /><span>Vendedores</span>
            </NavLink>
            <NavLink to="/reportes" className={navLink}>
              <IconReports /><span>Reportes</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/resenas`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Reseñas</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/categorias`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Categorías</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/clientes`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Clientes</span>
            </NavLink>
          </>
        )}
        {role === 'Employee' && (
          <>
            <NavLink to="/vendedor" end className={navLink}>
              <IconDashboard /><span>Panel de Control</span>
            </NavLink>
            <NavLink to="/ventas/registrar" className={navLink}>
              <IconSales /><span>Nueva Venta</span>
            </NavLink>
            <NavLink to="/ventas/historial" className={navLink}>
              <IconReports /><span>Historial de Ventas</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/catalogo`} className={navLink}>
              <IconInventory /><span>Catálogo</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/resenas`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Reseñas</span>
            </NavLink>
          </>
        )}
      </nav>
      <div className="px-4 pt-4 border-t border-white/5 space-y-1 mt-auto">
        <NavLink to="/ajustes" className={navLink}>
          <IconSettings /><span>Ajustes</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white transition-all text-left cursor-pointer"
        >
          <IconLogout /><span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
}
function AdminTopbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { products, sales } = useGlobalData();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  
  const notifsEnabled = localStorage.getItem('notifs_enabled') !== 'false';
  
  // Generar notificaciones dinámicas
  const notifications = [];
  if (notifsEnabled) {
    // Stock bajo (<=15)
    products?.forEach(p => {
      if ((p.stock || 0) <= 15) {
        notifications.push({
          id: `stock-${p._id || p.id}`,
          title: `Stock Bajo: ${p.nombreProducto || p.name} (${p.stock} unid.)`,
          time: 'Alerta de Inventario'
        });
      }
    });

    // Ventas recientes (las últimas 3)
    const recentSales = (sales || [])
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 3);
      
    recentSales.forEach(s => {
      const time = s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Reciente';
      notifications.push({
        id: `sale-${s._id || s.id}`,
        title: `Nueva Venta: #${(s._id || s.id).toString().substring(0,6)}`,
        time: time
      });
    });
  }
  return (
    <header className="h-[72px] flex items-center justify-between md:justify-end px-4 md:px-8 flex-shrink-0 bg-[#0d1114] border-b border-white/5">
      <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white p-2">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative">
          <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} className="relative p-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
            <IconBell />
            {notifsEnabled && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-[#0d1114] rounded-full"></span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-[#161b1e] border border-white/10 rounded-[10px] shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-white/10 bg-[#0d1114]">
                <h3 className="text-white text-[13px] font-semibold">Notificaciones</h3>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <p className="text-gray-200 text-[13px]">{n.title}</p>
                    <p className="text-gray-500 text-[11px] mt-1">{n.time}</p>
                  </div>
                )) : (
                  <div className="p-6 text-center text-gray-500 text-[13px]">No hay notificaciones recientes</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 sm:pr-3 rounded-full transition-colors">
            <div className="w-8 h-8 bg-[#1b4332] text-[#4ade80] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-gray-200 text-[13px] font-semibold leading-none">{user?.name || 'Alexander Vance'}</p>
              <p className="text-gray-500 text-[11px] mt-1">{user?.role === 'Admin' ? 'Gerente' : 'Vendedor'}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-[#161b1e] border border-white/10 rounded-[10px] shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#0d1114] flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1b4332] text-[#4ade80] rounded-full flex items-center justify-center text-[16px] font-bold flex-shrink-0">
                  {(user?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-[14px] font-semibold truncate">{user?.name || 'Alexander Vance'}</p>
                  <p className="text-gray-400 text-[12px] mt-0.5 truncate">{user?.email || 'admin@pronatural.com'}</p>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left cursor-pointer"
                >
                  <IconLogout /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0d1114] font-sans overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        <AdminTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
        <footer className="hidden md:flex absolute bottom-0 left-0 right-0 px-8 py-4 items-center justify-between pointer-events-none">
          <p className="text-[#4ade80] text-[11px] font-bold tracking-wider pointer-events-auto">Pro Natural</p>
          <p className="text-gray-600 text-[11px] pointer-events-auto">© 2024 Pro Natural. Pasión por la naturaleza.</p>
          <div className="flex gap-4 pointer-events-auto">
            <button className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors">Política de Privacidad</button>
            <button className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors">Términos de Servicio</button>
            <button className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors">Soporte</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

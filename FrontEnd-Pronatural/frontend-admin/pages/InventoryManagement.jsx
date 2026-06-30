import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';
function MetricHorizontal({ icon, bgClass, textClass, label, value }) {
  return (
    <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgClass} ${textClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-[12px] mb-1">{label}</p>
        <p className="text-white text-[24px] font-bold leading-none">{value}</p>
      </div>
    </div>
  );
}
function StatusBadge({ status }) {
  let bg = '', text = '';
  if (status === 'En Stock') { bg = 'bg-[#1b4332]'; text = 'text-[#4ade80]'; }
  else if (status === 'Stock Bajo') { bg = 'bg-red-950/80'; text = 'text-red-400'; }
  else { bg = 'bg-white/10'; text = 'text-gray-400'; }
  return (
    <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold tracking-wide ${bg} ${text}`}>
      {status}
    </span>
  );
}
export default function InventoryManagement() {
  const { products } = useGlobalData();
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState('');

  const LOW_STOCK_THRESHOLD = 15;
  const lowStockCount = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;
  const categories = [...new Set(products.map(p => p.category))].length;
  
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(filterText.toLowerCase()) || 
    p.category?.toLowerCase().includes(filterText.toLowerCase())
  );

  const topInventory = filteredProducts.slice(0, 4).map(p => ({
    id: p.id,
    category: (p.category || 'General').toUpperCase(),
    name: p.name,
    stock: p.stock,
    unit: 'u',
    status: p.stock <= 0 ? 'Agotado' : p.stock <= LOW_STOCK_THRESHOLD ? 'Stock Bajo' : 'En Stock',
    img: p.img || null,
    progress: Math.min(100, Math.round((p.stock / 200) * 100)),
  }));
  
  const tableData = filteredProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category || 'General',
    status: p.stock <= 0 ? 'Agotado' : p.stock <= LOW_STOCK_THRESHOLD ? 'Stock Bajo' : 'En Stock',
    stock: p.stock,
    unit: 'u',
    img: p.img || 'https://images.unsplash.com/photo-1587049352851-8d4e89134b3e?w=60&fit=crop'
  }));
  
  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Gestión de Inventario</h1>
          <p className="text-gray-400 text-[14px] mt-1 max-w-xl">
            Gestione sus existencias, actualice cantidades y realice el seguimiento del estado de los productos.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          {showFilter && (
            <input 
              type="text" 
              placeholder="Buscar producto o categoría..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="px-4 py-2 bg-[#161b1e] border border-white/10 text-white text-[13px] rounded-[10px] focus:outline-none focus:border-[#75e29f] transition-colors w-64"
              autoFocus
            />
          )}
          <button 
            onClick={() => { setShowFilter(!showFilter); if(showFilter) setFilterText(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 bg-transparent border text-[13px] font-medium rounded-[10px] transition-colors cursor-pointer ${showFilter ? 'border-[#75e29f] text-[#75e29f]' : 'border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {showFilter ? 'Cerrar' : 'Filtrar'}
          </button>
          <button 
            onClick={() => navigate('/admin/catalogo')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#75e29f] hover:bg-[#5bc285] text-[#0a110d] text-[13px] font-bold rounded-[10px] transition-colors cursor-pointer"
          >
            + Añadir Producto
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <MetricHorizontal 
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
          bgClass="bg-[#1b4332]" textClass="text-[#4ade80]"
          label="Total de Productos" value={String(products.length)}
        />
        <MetricHorizontal 
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          bgClass="bg-red-950/80" textClass="text-red-400"
          label="Productos en Stock Bajo" value={String(lowStockCount)}
        />
        <MetricHorizontal 
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
          bgClass="bg-[#3e3427]" textClass="text-[#d4a373]"
          label="Categorías Activas" value={String(categories)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {topInventory.map(item => (
          <div key={item.id} className="bg-[#161b1e] border border-white/5 rounded-[14px] flex flex-col overflow-hidden relative group">
            <div className="h-[160px] bg-[#0d1114] relative">
              {item.img ? (
                <img src={item.img} alt={item.name} className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="40" height="40" fill="none" stroke="#333" strokeWidth="1" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] text-gray-500 font-bold tracking-widest">{item.category}</p>
                {item.stock !== null && (
                  <p className={`text-[15px] font-bold ${item.status === 'Stock Bajo' ? 'text-red-400' : 'text-white'}`}>
                    {item.stock} <span className="text-[11px] font-normal text-gray-500">{item.unit}</span>
                  </p>
                )}
              </div>
              <h3 className="text-[15px] text-white font-semibold leading-tight mb-4 flex-1">
                {item.name}
              </h3>
              {item.status !== 'Borrador' && (
                <div className="w-full h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.status === 'Stock Bajo' ? 'bg-red-500' : 'bg-[#30b466]'}`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-auto">
                <button className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                {item.status !== 'Borrador' ? (
                  <button className={`flex items-center gap-1.5 text-[12px] transition-colors cursor-pointer ${item.status === 'Stock Bajo' ? 'text-red-400 hover:text-red-300' : 'text-[#4ade80] hover:text-[#75e29f]'}`}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Reponer
                  </button>
                ) : (
                  <button className="text-[12px] text-[#4ade80] hover:text-[#75e29f] transition-colors cursor-pointer">
                    Terminar Configuración
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#161b1e] rounded-[14px] p-6 border border-white/5 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-[12px] text-gray-400 font-medium">Nombre del Producto</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium">Categoría</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium text-center">Estado</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium text-right pr-12">Nivel de Stock</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableData.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <img src={item.img} className="w-8 h-8 rounded-[6px] object-cover" alt="" />
                    <span className="text-[13px] text-white font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="py-4 text-[13px] text-gray-400">{item.category}</td>
                <td className="py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className={`py-4 text-[13px] font-bold text-right pr-12 ${item.status === 'Stock Bajo' ? 'text-red-400' : 'text-gray-200'}`}>
                  {item.stock} <span className="text-[11px] font-normal text-gray-500">{item.unit}</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button className="text-[#30b466] hover:text-[#4ade80] transition-colors cursor-pointer">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className={`${item.status === 'Stock Bajo' ? 'text-red-400 hover:text-red-300' : 'text-[#30b466] hover:text-[#4ade80]'} transition-colors cursor-pointer`}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

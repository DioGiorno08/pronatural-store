import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import toast from 'react-hot-toast';
export default function SalesHistory() {
  const { sales, deleteSale, updateSaleStatus } = useGlobalData();
  const [filterMode, setFilterMode] = useState('all'); 
  const [filterValue, setFilterValue] = useState('');
  const filteredSales = sales.filter(sale => {
    if (filterMode === 'all') return true;
    const saleDateStr = (sale.createdAt || sale.date) ? (sale.createdAt || sale.date).split('T')[0] : ''; 
    if (filterMode === 'date' && filterValue) {
      return saleDateStr === filterValue;
    }
    if (filterMode === 'month' && filterValue) {
      return saleDateStr.startsWith(filterValue); 
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de venta?')) {
      deleteSale(id);
      toast.success('Venta eliminada del registro');
    }
  };
  const handleConfirmWhatsAppSale = async (id) => {
    if (window.confirm('¿Confirmar que el pago de WhatsApp fue recibido?')) {
      try {
        await updateSaleStatus(id, 'Completado');
        toast.success('Venta de WhatsApp confirmada y stock descontado.');
      } catch (error) {
        toast.error('Error al confirmar la venta.');
      }
    }
  };
  const handleEdit = (id) => {
    toast.error('Edición de ventas en desarrollo');
  };
  const handleFilterModeChange = (e) => {
    setFilterMode(e.target.value);
    setFilterValue('');
  };
  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Historial de Ventas</h1>
          <p className="text-gray-400 text-[14px] mt-1">Revisa el registro completo de transacciones realizadas.</p>
        </div>
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-[#161b1e] p-1.5 rounded-[12px] border border-white/10">
          <select 
            value={filterMode} 
            onChange={handleFilterModeChange}
            className="bg-transparent text-gray-300 text-[13px] font-medium px-2 py-1 outline-none border-r border-white/10 cursor-pointer"
          >
            <option value="all">Todas las ventas</option>
            <option value="date">Día específico</option>
            <option value="month">Mes específico</option>
          </select>
          {filterMode === 'date' && (
            <input 
              type="date" 
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="bg-transparent text-gray-300 text-[13px] outline-none px-2 py-1"
            />
          )}
          {filterMode === 'month' && (
            <input 
              type="month" 
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="bg-transparent text-gray-300 text-[13px] outline-none px-2 py-1"
            />
          )}
        </div>
        </div>
      </div>
      <div className="bg-[#161b1e] border border-white/5 rounded-[12px] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] text-white font-semibold">Registro General</h2>
          <div className="text-[12px] text-gray-400">Total Transacciones: {sales.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#0d1114]">
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold w-[120px]">ID Venta</th>
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Cliente</th>
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Fecha</th>
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Items</th>
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Monto</th>
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Estado</th>
                <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 text-[14px]">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const saleDate = sale.createdAt ? new Date(sale.createdAt) : (sale.date ? new Date(sale.date) : new Date());
                  const formattedDate = saleDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  
                  const productsArray = sale.products || sale.items;
                  const itemsCount = Array.isArray(productsArray) 
                    ? productsArray.reduce((acc, curr) => acc + (curr.quantity || 1), 0)
                    : 1;

                  const clientName = sale.customerId && sale.customerId.name 
                    ? `${sale.customerId.name} ${sale.customerId.lastName}`
                    : sale.client || 'Cliente General';

                  const saleAmount = sale.total || sale.amount || 0;
                  const saleId = sale._id || sale.id;

                  return (
                    <tr key={saleId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-[13px] font-mono text-[#4ade80] font-medium">{String(saleId).slice(-6).toUpperCase()}</td>
                      <td className="py-4 px-6 text-[14px] text-gray-200 font-medium">{clientName}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-400">{formattedDate}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-300">{itemsCount} arts.</td>
                      <td className="py-4 px-6 text-[14px] text-white font-bold">${saleAmount.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-bold border ${
                          sale.status === 'Completado'
                          ? 'bg-[#1b4332]/40 text-[#4ade80] border-[#30b466]/30' 
                          : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sale.status === 'Completado' ? 'bg-[#4ade80]' : 'bg-gray-400'}`}></span>
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sale.status === 'Pendiente WhatsApp' && (
                            <button onClick={() => handleConfirmWhatsAppSale(sale.id || sale._id)} className="w-8 h-8 rounded-[8px] bg-[#4ade80]/10 hover:bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80] transition-colors cursor-pointer" title="Confirmar Venta WhatsApp">
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                          )}
                          <button onClick={() => handleEdit(sale.id)} className="w-8 h-8 rounded-[8px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer" title="Editar Venta">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(sale.id)} className="w-8 h-8 rounded-[8px] bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer" title="Eliminar Venta">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

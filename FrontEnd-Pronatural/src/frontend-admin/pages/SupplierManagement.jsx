import { useSuppliers } from '../../hooks/useSuppliers';
export default function SupplierManagement() {
  const { suppliers, loading } = useSuppliers();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#154734]"></div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <span className="text-[10px] font-bold text-orange-700 tracking-[0.2em] uppercase">GESTIÓN DE PROVEEDORES</span>
        <h1 className="text-4xl md:text-[56px] font-bold leading-tight tracking-tighter text-brand-dark mt-2">
          PROVEEDORES
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-[#fdfaf6] border border-gray-200 p-8 flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-200 pb-5 mb-6">
                <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">ID: {supplier.id}</span>
                <h3 className="text-xl font-bold text-brand-dark uppercase tracking-tight mt-1">{supplier.name}</h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">CONTACTO</span>
                  <span className="text-brand-dark font-semibold">{supplier.contactName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">TELÉFONO</span>
                  <span className="text-brand-dark font-semibold">{supplier.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">CORREO</span>
                  <span className="text-brand-dark font-semibold lowercase">{supplier.email}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#b45309] tracking-widest uppercase block mb-4">HISTORIAL DE PEDIDOS</span>
              <div className="space-y-2 bg-[#f4f3ec] p-4 border border-gray-200">
                {supplier.history && supplier.history.map(order => (
                  <div key={order.id} className="flex justify-between items-center text-[11px] border-b border-gray-300 pb-2 last:border-b-0 last:pb-0">
                    <span className="font-bold text-brand-dark">{order.id}</span>
                    <span className="text-gray-500">{order.date}</span>
                    <span className="font-bold text-[#154734]">${order.total.toFixed(2)}</span>
                    <span className="text-[9px] font-bold bg-green-100 text-green-800 px-2 py-0.5 uppercase tracking-widest">{order.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

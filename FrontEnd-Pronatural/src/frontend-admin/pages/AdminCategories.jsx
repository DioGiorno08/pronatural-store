import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { toast } from 'react-hot-toast';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useGlobalData();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }
    try {
      if (editingId) {
        await updateCategory(editingId, { name });
        toast.success('Categoría actualizada');
      } else {
        await addCategory({ name });
        toast.success('Categoría creada');
      }
      setName('');
      setEditingId(null);
    } catch (err) {
      toast.error('Error al guardar la categoría');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id || cat.id);
    setName(cat.nombre || cat.name || '');
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
        toast.success('Categoría eliminada');
      } catch (err) {
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Gestión de Categorías</h1>
        <p className="text-gray-400 text-[14px] mt-1">Crea, edita y organiza las categorías de tus productos.</p>
      </div>

      <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6">
        <h2 className="text-[16px] text-white font-semibold mb-6">
          {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
            <input
              type="text"
              placeholder="Ej. Suplementos, Vitaminas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1114] border border-white/10 rounded-[8px] px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#30b466] focus:ring-1 focus:ring-[#30b466]/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2.5 bg-transparent border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-[13px] font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] text-[13px] font-bold rounded-[8px] transition-colors cursor-pointer shadow-[0_0_15px_rgba(48,180,102,0.3)]"
            >
              {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#161b1e] border border-white/5 rounded-[12px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#0d1114]/50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium w-32">ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Nombre de Categoría</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider text-gray-500 font-medium text-right w-48">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat._id || cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-[12px] text-[#4ade80] font-mono">
                      #{ (cat._id || cat.id || '').toString().substring(0,6) }
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-200 font-medium">{cat.nombre || cat.name}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="px-3 py-1.5 bg-[#1b4332]/40 border border-[#30b466]/30 text-[#4ade80] text-[12px] font-bold rounded-[6px] hover:bg-[#1b4332] transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id || cat.id)}
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold rounded-[6px] hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500 text-[13px]">
                    No hay categorías registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

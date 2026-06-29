import { useState, useEffect } from 'react';
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
    setEditingId(cat.id);
    setName(cat.name);
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
  return (
    <div className="p-8 max-w-3xl mx-auto bg-[#0d1114] rounded-lg text-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-[#4ade80]">Gestión de Categorías</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-[#161b1e] border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#4ade80] text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#1b4332] text-[#4ade80] rounded hover:bg-[#154734] transition-colors"
        >
          {editingId ? 'Actualizar' : 'Crear'}
        </button>
      </form>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#1b4332] text-[#4ade80]">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-700">
                <td className="p-2">{cat.id}</td>
                <td className="p-2">{cat.name}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="px-2 py-1 bg-[#154734] text-[#4ade80] rounded hover:bg-[#113d2c]"
                  >Editar</button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                  >Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-400">No hay categorías</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

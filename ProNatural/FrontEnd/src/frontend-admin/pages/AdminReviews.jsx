import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGlobalData } from '../../context/GlobalDataContext';
export default function AdminReviews() {
  const { reviews, deleteReview } = useGlobalData();
  const [filterRating, setFilterRating] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filterRating));
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0
  }));
  const handleDelete = (id) => {
    deleteReview(id);
    setConfirmDeleteId(null);
    toast.success('Reseña eliminada exitosamente');
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Gestión de Reseñas</h1>
          <p className="text-gray-500 text-sm mt-1">{reviews.length} reseñas en total</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Promedio General</p>
          <div className="flex items-center gap-3">
            <span className="text-[#4ade80] text-3xl font-bold">{avgRating}</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(avgRating)) ? 'text-yellow-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Total Reseñas</p>
          <span className="text-white text-3xl font-bold">{reviews.length}</span>
        </div>
        <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Positivas (4-5★)</p>
          <span className="text-[#4ade80] text-3xl font-bold">
            {reviews.filter(r => r.rating >= 4).length}
          </span>
        </div>
        <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Negativas (1-2★)</p>
          <span className="text-rose-400 text-3xl font-bold">
            {reviews.filter(r => r.rating <= 2).length}
          </span>
        </div>
      </div>
      <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6">
        <h3 className="text-white text-sm font-bold mb-4">Distribución de Calificaciones</h3>
        <div className="space-y-2">
          {ratingCounts.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-gray-400 text-xs w-14 shrink-0">{star} ★</span>
              <div className="flex-1 h-2 bg-[#0d1117] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${star >= 4 ? 'bg-[#4ade80]' : star === 3 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-gray-500 text-xs w-12 text-right">{count} ({pct}%)</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Filtrar por:</span>
        <div className="flex gap-2">
          {['all', '5', '4', '3', '2', '1'].map(val => (
            <button
              key={val}
              onClick={() => setFilterRating(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterRating === val
                  ? 'bg-[#1b4332] text-[#4ade80]'
                  : 'bg-[#161b22] text-gray-400 hover:text-white border border-[#1e2a1e]'
              }`}
            >
              {val === 'all' ? 'Todas' : `${val} ★`}
            </button>
          ))}
        </div>
        <span className="text-gray-600 text-xs ml-auto">{filteredReviews.length} resultados</span>
      </div>
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-12 text-center">
            <p className="text-gray-500 text-sm">No hay reseñas con este filtro.</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6 hover:border-[#22c55e]/20 transition-all duration-200 group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-[#1b4332] text-[#4ade80] rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white text-sm font-bold">{review.name}</h3>
                      <span className="text-gray-600 text-[10px] font-mono">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-400 text-[13px] leading-relaxed">"{review.comment}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {confirmDeleteId === review.id ? (
                    <div className="flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                      <span className="text-rose-400 text-[10px] uppercase tracking-wider font-bold">¿Eliminar?</span>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-500/30 transition-colors cursor-pointer"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(review.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      title="Eliminar reseña"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

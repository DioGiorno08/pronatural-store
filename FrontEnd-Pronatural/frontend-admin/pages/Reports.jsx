import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGlobalData } from '../../context/GlobalDataContext';
import { useNavigate } from 'react-router-dom';

function MetricReportCard({ icon, label, value, trend, trendUp }) {
  return (
    <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5 flex flex-col justify-between h-[130px]">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center text-[#4ade80]">
          {icon}
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
          trendUp ? 'bg-[#1b4332] text-[#4ade80]' : 'bg-red-950/50 text-red-400'
        }`}>
          {trendUp ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          )}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-[12px] mb-1">{label}</p>
        <p className="text-[24px] text-white font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('Mensual');
  const [reportPeriod, setReportPeriod] = useState('all');
  const { sales: allSales, products, stats } = useGlobalData();
  
  const now = new Date();
  const sales = useMemo(() => {
    if (reportPeriod === 'all') return allSales;
    return allSales.filter(s => {
      const d = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      if (reportPeriod === 'this_month') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (reportPeriod === 'last_month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === year;
      }
      
      const dayOfWeek = now.getDay() || 7; 
      const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      startOfThisWeek.setHours(0,0,0,0);
      
      if (reportPeriod === 'this_week') {
        return d >= startOfThisWeek;
      }
      if (reportPeriod === 'last_week') {
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        return d >= startOfLastWeek && d < startOfThisWeek;
      }
      return true;
    });
  }, [allSales, reportPeriod, now]);

  const filteredTotalRevenue = sales.reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);
  const filteredTotalOrders = sales.length;

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const periodLabels = {
      'all': 'Histórico Completo',
      'this_month': 'Este Mes',
      'last_month': 'Mes Pasado',
      'this_week': 'Esta Semana',
      'last_week': 'Semana Pasada'
    };
    
    doc.text(`Reporte de Estadísticas y Ventas - ${periodLabels[reportPeriod]}`, 14, 15);
    
    // Generar tabla
    const tableColumn = ["ID Pedido", "Cliente", "Fecha", "Método Pago", "Total"];
    const tableRows = [];

    sales.forEach(s => {
      const saleDate = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
      const clientName = s.customerId ? `${s.customerId.name || ''} ${s.customerId.lastName || ''}`.trim() : (s.client || 'Cliente General');
      const saleData = [
        s._id || s.id,
        clientName,
        saleDate.toLocaleDateString(),
        s.paymentMethod || 'Efectivo',
        `$${(s.total || s.amount || 0).toFixed(2)}`
      ];
      tableRows.push(saleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [48, 180, 102] }
    });
    
    // Información del mes / totales
    const finalY = doc.lastAutoTable?.finalY || 25;
    doc.text(`Total Ingresos: $${filteredTotalRevenue.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Pedidos: ${filteredTotalOrders}`, 14, finalY + 20);
    
    doc.save(`Reporte_ProNatural_${periodLabels[reportPeriod].replace(/ /g, '_')}.pdf`);
  };

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const chartDataMap = {};
  
  if (timeRange === 'Mensual') {
    sales.forEach(sale => {
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : (sale.date ? new Date(sale.date) : new Date());
      const m = MONTHS[saleDate.getMonth()];
      chartDataMap[m] = (chartDataMap[m] || 0) + (sale.total || sale.amount || 0);
    });
  } else {
    // Semanal: Últimos 7 días
    sales.forEach(sale => {
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : (sale.date ? new Date(sale.date) : new Date());
      const diffTime = Math.abs(now - saleDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        const dName = DAYS[saleDate.getDay()];
        chartDataMap[dName] = (chartDataMap[dName] || 0) + (sale.total || sale.amount || 0);
      }
    });
  }

  const chartData = useMemo(() => {
    if (timeRange === 'Mensual') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const name = MONTHS[d.getMonth()];
        return { name, value: Math.round(chartDataMap[name] || 0) };
      });
    } else {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const name = DAYS[d.getDay()];
        return { name, value: Math.round(chartDataMap[name] || 0) };
      });
    }
  }, [timeRange, chartDataMap, now]);
  const topProducts = [...products]
    .sort((a, b) => (b.precio || b.price || 0) - (a.precio || a.price || 0))
    .slice(0, 3)
    .map(p => ({ 
      id: p._id || p.id, 
      name: p.nombreProducto || p.name, 
      sales: `${p.stock || 0} en Stock`, 
      revenue: `$${((p.precio || p.price || 0) * 10).toFixed(2)}`, 
      img: p.imagenProducto?.[0] || p.img 
    }));
  const inventoryStatus = products.slice(0, 3).map(p => ({
    name: p.nombreProducto || p.name,
    percent: Math.min(100, Math.round(((p.stock || 0) / 200) * 100)),
    label: (p.stock || 0) <= 15 ? `${p.stock || 0} (Bajo)` : `${p.stock || 0} unidades`,
    status: (p.stock || 0) <= 15 ? 'low' : 'normal'
  }));
  const recentTx = sales.slice(0, 4).map(s => {
    const saleDate = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
    const clientName = s.customerId ? `${s.customerId.name || ''} ${s.customerId.lastName || ''}`.trim() : (s.client || 'Cliente General');
    return {
      id: `#${s._id ? s._id.toString().substring(0,6) : s.id}`, 
      client: clientName || 'Cliente General',
      time: saleDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: s.status || 'Completado', 
      amount: `$${(s.total || s.amount || 0).toFixed(2)}`
    };
  });
  const newClients = sales.filter(s => {
    const d = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Análisis y Reportes</h1>
          <p className="text-gray-400 text-[14px] mt-1">Visión completa de las métricas de rendimiento.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="bg-[#0d1114] border border-white/10 text-gray-300 text-[13px] rounded-[10px] px-4 py-2.5 outline-none focus:border-[#30b466] cursor-pointer"
          >
            <option value="all">Histórico Completo</option>
            <option value="this_month">Este Mes</option>
            <option value="last_month">Mes Pasado</option>
            <option value="this_week">Esta Semana</option>
            <option value="last_week">Semana Pasada</option>
          </select>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] text-[13px] font-bold rounded-[10px] transition-colors cursor-pointer shadow-[0_0_15px_rgba(48,180,102,0.3)]"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        <MetricReportCard 
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          label="Ingresos Totales" value={`$${stats.totalRevenue.toFixed(2)}`} trend="Real" trendUp
        />
        <MetricReportCard 
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
          label="Pedidos Totales" value={String(stats.totalOrders)} trend="Real" trendUp
        />
        <MetricReportCard 
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          label="Inventario Activo" value={String(stats.activeInventory)} trend="Real" trendUp={false}
        />
        <MetricReportCard 
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Ventas del Mes" value={String(newClients)} trend="Real" trendUp
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-6">
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] text-white font-semibold">Ingresos en el Tiempo</h2>
            <div className="bg-[#0d1114] border border-white/5 p-1 rounded-full flex gap-1">
              <button 
                onClick={() => setTimeRange('Semanal')}
                className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${timeRange === 'Semanal' ? 'bg-[#30b466] text-[#0a110d]' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Semanal
              </button>
              <button 
                onClick={() => setTimeRange('Mensual')}
                className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${timeRange === 'Mensual' ? 'bg-[#30b466] text-[#0a110d]' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Mensual
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0d1114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4ade80' : '#1b4332'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6 flex flex-col">
          <h2 className="text-[16px] text-white font-semibold mb-6">Productos Más<br/>Vendidos</h2>
          <div className="flex-1 space-y-5">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.img} alt={p.name} className="w-12 h-12 rounded-[8px] object-cover bg-[#0d1114]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.sales}</p>
                </div>
                <span className="text-[13px] font-bold text-[#4ade80]">{p.revenue}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/inventario')}
            className="w-full py-2.5 mt-6 border border-white/10 rounded-[8px] text-[12px] font-bold text-[#30b466] hover:bg-white/5 transition-colors cursor-pointer"
          >
            Ver Todos los Productos
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] text-white font-semibold">Estado del Inventario</h2>
            <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
          <div className="space-y-5">
            {inventoryStatus.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[12px] text-gray-300 font-medium">{item.name}</p>
                  <p className={`text-[10px] font-bold ${item.status === 'low' ? 'text-red-400' : 'text-[#4ade80]'}`}>
                    {item.label}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.status === 'low' ? 'bg-red-400' : 'bg-[#4ade80]'}`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6">
          <h2 className="text-[16px] text-white font-semibold mb-6">Transacciones Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">ID Pedido</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Cliente</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Fecha</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Estado</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTx.map((tx, idx) => (
                  <tr key={`${tx.id}-${idx}`}>
                    <td className="py-3 text-[12px] text-[#4ade80] font-mono">{tx.id}</td>
                    <td className="py-3 text-[13px] text-gray-200">{tx.client}</td>
                    <td className="py-3 text-[12px] text-gray-400">
                      <span dangerouslySetInnerHTML={{ __html: tx.time.replace(', ', '<br/>') }} />
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                        tx.status === 'Completado' 
                        ? 'bg-[#1b4332]/40 text-[#4ade80] border-[#30b466]/30' 
                        : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-[13px] text-white font-medium text-right">{tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

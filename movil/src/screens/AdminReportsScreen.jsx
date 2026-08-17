import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// importamos el hook useAuth para acceder a los endpoints del servidor
import useAuth from "../hooks/useAuth";

const AdminReportsScreen = () => {
  // utilizamos el hook useAuth para obtener el usuario activo y la función authFetch
  const { user, authFetch } = useAuth();

  const [sales, setSales]           = useState([]);
  const [products, setProducts]     = useState([]);
  const [sellers, setSellers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);

  const [salesPeriod, setSalesPeriod] = useState("ALL");

  const loadData = async () => {
    try {
      const [resSales, resProducts, resSellers] = await Promise.allSettled([
        authFetch("/sales"),
        authFetch("/products"),
        authFetch("/empleados"),
      ]);

      setSales(resSales.status === "fulfilled" ? (Array.isArray(resSales.value) ? resSales.value : (resSales.value.sales || [])) : []);
      setProducts(resProducts.status === "fulfilled" ? (Array.isArray(resProducts.value) ? resProducts.value : (resProducts.value.products || [])) : []);
      setSellers(resSellers.status === "fulfilled" ? (Array.isArray(resSellers.value) ? resSellers.value : (resSellers.value.empleados || resSellers.value.data || [])) : []);
    } catch (error) {
      Alert.alert("Error al cargar datos", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadData(); }, []));

  const getFilteredSales = () => {
    const now = new Date();
    return sales.filter(s => {
      const date = new Date(s.createdAt || s.fechaVenta || Date.now());
      if (salesPeriod === "TODAY") {
        return date.toDateString() === now.toDateString();
      }
      if (salesPeriod === "WEEK") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= oneWeekAgo;
      }
      if (salesPeriod === "MONTH") {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const generateSalesHTML = (filteredSales) => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const avgOrder = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const dateStr = new Date().toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const rows = filteredSales.map(s => {
      const id = (s._id || "").slice(-6).toUpperCase();
      const client = s.customerId?.nombre || s.cliente?.nombre || "Cliente General";
      const fecha = new Date(s.createdAt || s.fechaVenta || Date.now()).toLocaleDateString("es-SV");
      const status = s.estado || s.status || "Pendiente";
      const total = (s.total || 0).toFixed(2);
      return `
        <tr>
          <td>#${id}</td>
          <td>${client}</td>
          <td>${fecha}</td>
          <td><span class="badge ${status.toLowerCase()}">${status}</span></td>
          <td style="text-align: right; font-weight: bold;">$${total}</td>
        </tr>
      `;
    }).join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 13px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #30b466; padding-bottom: 15px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; color: #30b466; margin: 0; }
            .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .meta { text-align: right; font-size: 11px; color: #64748b; }
            .kpis { display: flex; gap: 15px; margin-bottom: 25px; }
            .kpi-card { flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .kpi-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f1f5f9; color: #475569; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .badge.completado, .badge.entregado { background-color: #dcfce7; color: #15803d; }
            .badge.pendiente { background-color: #fef3c7; color: #b45309; }
            .badge.cancelado { background-color: #fee2e2; color: #b91c1c; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">ProNatural Store</h1>
              <div class="subtitle">Reporte Ejecutivo de Ventas</div>
            </div>
            <div class="meta">
              <div><strong>Generado por:</strong> ${user?.name || "Administrador"}</div>
              <div><strong>Fecha:</strong> ${dateStr}</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">Ingresos Totales</div>
              <div class="kpi-value" style="color: #15803d;">$${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total de Ventas</div>
              <div class="kpi-value">${filteredSales.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Ticket Promedio</div>
              <div class="kpi-value">$${avgOrder.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Orden ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style="text-align: right;">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Sin registros de ventas para el período seleccionado</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Documento de reporte confidencial generado desde el Portal Móvil ProNatural Admin.
          </div>
        </body>
      </html>
    `;
  };

  const generateInventoryHTML = () => {
    const totalInventoryValue = products.reduce((acc, p) => acc + ((p.price || p.precio || 0) * (p.stock || 0)), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) <= 15).length;
    const dateStr = new Date().toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const rows = products.map(p => {
      const name = p.name || p.nombreProducto || "Producto";
      const cat = p.category || p.idCategoria || "General";
      const price = parseFloat(p.price !== undefined ? p.price : (p.precio || 0));
      const stock = p.stock !== undefined ? p.stock : 0;
      const totalVal = (price * stock).toFixed(2);
      const isLow = stock <= 15;

      return `
        <tr ${isLow ? 'style="background-color: #fff1f2;"' : ""}>
          <td><strong>${name}</strong></td>
          <td>${cat}</td>
          <td>$${price.toFixed(2)}</td>
          <td><span style="font-weight: bold; color: ${isLow ? "#e11d48" : "#16a34a"};">${stock} unidades ${isLow ? "⚠️" : ""}</span></td>
          <td style="text-align: right; font-weight: bold;">$${totalVal}</td>
        </tr>
      `;
    }).join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 13px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #30b466; padding-bottom: 15px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; color: #30b466; margin: 0; }
            .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .meta { text-align: right; font-size: 11px; color: #64748b; }
            .kpis { display: flex; gap: 15px; margin-bottom: 25px; }
            .kpi-card { flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .kpi-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f1f5f9; color: #475569; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">ProNatural Store</h1>
              <div class="subtitle">Reporte de Inventario y Valoración de Stock</div>
            </div>
            <div class="meta">
              <div><strong>Generado por:</strong> ${user?.name || "Administrador"}</div>
              <div><strong>Fecha:</strong> ${dateStr}</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">Productos en Catálogo</div>
              <div class="kpi-value">${products.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Valor Total del Inventario</div>
              <div class="kpi-value" style="color: #15803d;">$${totalInventoryValue.toFixed(2)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Alertas de Bajo Stock</div>
              <div class="kpi-value" style="color: ${lowStockCount > 0 ? "#e11d48" : "#15803d"};">${lowStockCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Unit.</th>
                <th>Existencia</th>
                <th style="text-align: right;">Valor Acumulado</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Sin productos registrados</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Reporte oficial de inventario de ProNatural Store.
          </div>
        </body>
      </html>
    `;
  };

  const generateSellersHTML = () => {
    const dateStr = new Date().toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const rows = sellers.map(s => {
      const fullName = `${s.name || s.nombre || ''} ${s.lastName || s.apellido || ''}`.trim() || "Empleado";
      const role = s.role || s.cargo || "Vendedor";
      const email = s.email || s.correo || "N/A";
      const phone = s.phone || s.telefono || "No registrado";
      const salaryNum = typeof s.salary === 'number' ? s.salary : (typeof s.salario === 'number' ? s.salario : 0);
      const salaryStr = `$${salaryNum.toFixed(2)}`;

      let ageStr = "N/A";
      const bday = s.birthdate || s.fechaNacimiento;
      if (bday) {
        const birth = new Date(bday);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          const formattedBday = birth.toLocaleDateString("es-SV");
          ageStr = `${formattedBday} (${age} años)`;
        }
      }

      return `
        <tr>
          <td><strong>${fullName}</strong></td>
          <td>${role}</td>
          <td>${email}</td>
          <td>${phone}</td>
          <td><strong>${salaryStr}</strong></td>
          <td>${ageStr}</td>
        </tr>
      `;
    }).join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #30b466; padding-bottom: 15px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; color: #30b466; margin: 0; }
            .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .meta { text-align: right; font-size: 11px; color: #64748b; }
            .kpis { display: flex; gap: 15px; margin-bottom: 25px; }
            .kpi-card { flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .kpi-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f1f5f9; color: #475569; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">ProNatural Store</h1>
              <div class="subtitle">Directorio de Vendedores y Personal</div>
            </div>
            <div class="meta">
              <div><strong>Generado por:</strong> ${user?.name || "Administrador"}</div>
              <div><strong>Fecha:</strong> ${dateStr}</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">Total de Vendedores / Personal</div>
              <div class="kpi-value">${sellers.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Cargo / Rol</th>
                <th>Correo Electrónico</th>
                <th>Teléfono</th>
                <th>Salario ($)</th>
                <th>F. Nacimiento / Edad</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">Sin vendedores registrados</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Documento de control interno de personal ProNatural.
          </div>
        </body>
      </html>
    `;
  };

  const handleExportPDF = async (reportType) => {
    setGenerating(true);
    try {
      let html = "";

      if (reportType === "SALES") {
        const filtered = getFilteredSales();
        html = generateSalesHTML(filtered);
      } else if (reportType === "INVENTORY") {
        html = generateInventoryHTML();
      } else if (reportType === "SELLERS") {
        html = generateSellersHTML();
      }

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir Reporte PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        await Print.printAsync({ uri });
      }
    } catch (e) {
      Alert.alert("Error al generar reporte", e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#0a0d0f", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#30b466" />
    </View>
  );

  const filteredSales = getFilteredSales();
  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0d0f" }} contentContainerStyle={styles.scroll}>
      <Text style={styles.headerTitle}>Generación de Reportes PDF</Text>
      <Text style={styles.headerSubtitle}>
        En esta pantalla podrás generar, imprimir y compartir reportes ejecutivos oficiales en formato PDF utilizando expo-print y expo-sharing.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(48, 180, 102, 0.12)" }]}>
            <Ionicons name="document-text" size={22} color="#30b466" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Reporte de Ventas e Ingresos</Text>
            <Text style={styles.cardDesc}>Resumen financiero con listado de pedidos y montos acumulados.</Text>
          </View>
        </View>

        <Text style={styles.filterLabel}>Filtrar Período:</Text>
        <View style={styles.periodRow}>
          {[
            { id: "ALL", label: "Todo" },
            { id: "TODAY", label: "Hoy" },
            { id: "WEEK", label: "7 días" },
            { id: "MONTH", label: "Este mes" },
          ].map(p => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.periodBtn,
                salesPeriod === p.id && styles.periodBtnActive,
              ]}
              onPress={() => setSalesPeriod(p.id)}
            >
              <Text style={[styles.periodTxt, salesPeriod === p.id && styles.periodTxtActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTxt}>
            {filteredSales.length} ventas encontradas · <Text style={{ color: "#4ade80", fontWeight: "bold" }}>${totalSalesAmount.toFixed(2)} USD</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, generating && { opacity: 0.6 }]}
          onPress={() => handleExportPDF("SALES")}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#0a110d" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#0a110d" />
              <Text style={styles.exportBtnTxt}>Exportar Reporte de Ventas (PDF)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
            <Ionicons name="cube" size={22} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Reporte de Inventario y Stock</Text>
            <Text style={styles.cardDesc}>Valoración total de inventario y desglose de existencias críticas.</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTxt}>
            {products.length} productos registrados · {products.filter(p => (p.stock || 0) <= 15).length} con bajo stock
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: "#3b82f6" }, generating && { opacity: 0.6 }]}
          onPress={() => handleExportPDF("INVENTORY")}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={[styles.exportBtnTxt, { color: "#fff" }]}>Exportar Reporte de Inventario (PDF)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]}>
            <Ionicons name="people" size={22} color="#8b5cf6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Directorio de Vendedores</Text>
            <Text style={styles.cardDesc}>Lista oficial del personal registrado con salario, contacto y edad.</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTxt}>{sellers.length} vendedores en la base de datos</Text>
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: "#8b5cf6" }, generating && { opacity: 0.6 }]}
          onPress={() => handleExportPDF("SELLERS")}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={[styles.exportBtnTxt, { color: "#fff" }]}>Exportar Directorio de Vendedores (PDF)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AdminReportsScreen;

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#121619",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDesc: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },
  filterLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  periodBtnActive: {
    backgroundColor: "rgba(48, 180, 102, 0.15)",
    borderColor: "#30b466",
  },
  periodTxt: {
    color: "#888",
    fontSize: 12,
  },
  periodTxtActive: {
    color: "#30b466",
    fontWeight: "bold",
  },
  summaryBox: {
    backgroundColor: "#0d1114",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 14,
  },
  summaryTxt: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
  },
  exportBtn: {
    backgroundColor: "#30b466",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  exportBtnTxt: {
    color: "#0a110d",
    fontSize: 14,
    fontWeight: "bold",
  },
});

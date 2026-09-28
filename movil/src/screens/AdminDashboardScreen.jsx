import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// importamos el hook useAuth para acceder a los datos de la sesión activa y realizar consultas
import useAuth from "../hooks/useAuth";
import AnimatedEntrance from "../components/AnimatedEntrance";
import AppIcon3D from "../components/AppIcon3D";

const LOW_STOCK_THRESHOLD = 15;

const MetricCard = ({ icon, color, label, value, isAlert, delay = 0 }) => {
  return (
    <AnimatedEntrance style={[styles.card, isAlert && { borderColor: "rgba(239, 68, 68, 0.4)" }]} delay={delay} distance={6} duration={260}>
      <AppIcon3D name={icon} size={42} iconSize={22} color={color} surface="#F3F1EB" depth="#D9D5CB" radius={14} style={{ marginBottom: 10 }} />
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </AnimatedEntrance>
  );
};

const AdminDashboardScreen = ({ navigation }) => {
  // utilizamos el hook useAuth para obtener el usuario autenticado y la función authFetch
  const { user, authFetch } = useAuth();

  const [data, setData]             = useState({ sales: [], products: [], customers: [] });
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // función para obtener todos los datos del dashboard en paralelo
  const load = async () => {
    try {
      const [sales, products, customers] = await Promise.all([
        authFetch("/sales"),
        authFetch("/products"),
        authFetch("/clientes"),
      ]);
      setData({
        sales: Array.isArray(sales) ? sales : (Array.isArray(sales?.sales) ? sales.sales : Array.isArray(sales?.data) ? sales.data : []),
        products: Array.isArray(products) ? products : (Array.isArray(products?.products) ? products.products : Array.isArray(products?.data) ? products.data : []),
        customers: Array.isArray(customers) ? customers : (Array.isArray(customers?.clientes) ? customers.clientes : Array.isArray(customers?.data) ? customers.data : []),
      });
    } catch (e) {
      Alert.alert("No se actualizó el panel", e.message || "Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F6", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0B2B1E" />
    </View>
  );

  const totalRevenue = data.sales.reduce((acc, sale) => acc + Number(sale.total || sale.amount || 0), 0);
  const weeklySales = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const amount = data.sales.reduce((sum, sale) => {
      const saleDate = new Date(sale.createdAt || sale.fechaVenta || "");
      if (Number.isNaN(saleDate.getTime())) return sum;
      saleDate.setHours(0, 0, 0, 0);
      const sameDay = saleDate.getTime() === day.getTime();
      return sameDay ? sum + Number(sale.total || sale.amount || 0) : sum;
    }, 0);
    return {
      label: day.toLocaleDateString("es-SV", { weekday: "short" }).replace(".", ""),
      amount,
    };
  });
  const highestDay = Math.max(...weeklySales.map((day) => day.amount), 0);
  const pendingOrders = data.sales.filter(s => ["Pendiente", "En Proceso"].includes(s.estado || s.status)).length;
  const lowStock = data.products.filter(p => (p.stock || 0) <= LOW_STOCK_THRESHOLD);
  const recentSales = data.sales.slice(0, 5);

  const STATUS_COLOR = {
    "Pendiente": "#B66A00", "En Proceso": "#557469", "Enviado": "#557469",
    "Entregado": "#208B51", "Completado": "#0B2B1E", "Cancelado": "#C43D2B",
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FAF9F6" }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#0B2B1E" />}
    >
      <View style={styles.greetingWrap}>
        <View>
          <Text style={styles.greetingLabel}>¡Bienvenido de nuevo,</Text>
          <Text style={styles.greetingName}>{user?.name?.split(" ")[0] || "Administrador"}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Resumen general del estado de tu tienda: ingresos, pedidos activos y alertas de stock en tiempo real.
      </Text>

      <View style={styles.grid}>
        <MetricCard icon="cash-outline" color="#0B2B1E" label="Ventas Totales" value={`$${totalRevenue.toFixed(2)}`} delay={0} />
        <MetricCard icon="bag-handle-outline" color="#557469" label="Total Pedidos" value={data.sales.length} delay={45} />
        <MetricCard icon="time-outline" color="#B66A00" label="Pendientes" value={pendingOrders} delay={90} />
        <MetricCard icon="warning-outline" color="#C43D2B" label="Bajo Stock" value={lowStock.length} isAlert={lowStock.length > 0} delay={135} />
        <MetricCard icon="people-outline" color="#557469" label="Clientes" value={data.customers.length} delay={180} />
        <MetricCard icon="cube-outline" color="#208B51" label="Productos" value={data.products.length} delay={225} />
      </View>

      <AnimatedEntrance style={styles.chartCard} delay={120} distance={8} duration={280}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Ventas de la semana</Text>
            <Text style={styles.chartSubtitle}>Ingresos registrados en los últimos 7 días</Text>
          </View>
          <View style={styles.chartTotalBadge}>
            <Text style={styles.chartTotal}>${weeklySales.reduce((sum, day) => sum + day.amount, 0).toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.chartBars} accessibilityLabel="Gráfica de ventas de los últimos siete días">
          {weeklySales.map((day, index) => {
            const barHeight = highestDay > 0 ? Math.max((day.amount / highestDay) * 90, day.amount > 0 ? 8 : 3) : 3;
            return (
              <View key={`${day.label}-${index}`} style={styles.chartColumn}>
                <Text style={styles.chartAmount}>{day.amount > 0 ? `$${day.amount.toFixed(0)}` : ""}</Text>
                <View style={styles.chartTrack}>
                  <View style={[styles.chartBar, { height: barHeight, opacity: day.amount > 0 ? 1 : 0.35 }]} />
                </View>
                <Text style={styles.chartDay}>{day.label}</Text>
              </View>
            );
          })}
        </View>
      </AnimatedEntrance>

      <TouchableOpacity
        style={styles.reportBanner}
        onPress={() => navigation.navigate("Reports")}
        activeOpacity={0.85}
      >
        <View style={styles.reportIconWrap}>
          <Ionicons name="document-text" size={22} color="#0B2B1E" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reportTitle}>Generar Reportes Ejecutivos PDF</Text>
          <Text style={styles.reportSub}>Ventas por período, estado de inventario y clientes</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#0B2B1E" />
      </TouchableOpacity>

      <View style={styles.block}>
        <View style={styles.blockHdr}>
          <Text style={styles.blockTitle}>Pedidos Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Sales")}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>
        {recentSales.length === 0 ? (
          <Text style={styles.empty}>Sin ventas registradas</Text>
        ) : (
          recentSales.map(sale => {
            const estado = sale.estado || sale.status || "Pendiente";
            const color = STATUS_COLOR[estado] || "#66736B";
            const id = (sale._id || "").slice(-6).toUpperCase();
            return (
              <View key={sale._id} style={styles.orderRow}>
                <Text style={styles.orderId}>#{id}</Text>
                <Text style={styles.orderClient} numberOfLines={1}>{sale.customerId?.nombre || "Cliente"}</Text>
                <View style={[styles.orderBadge, { backgroundColor: `${color}20` }]}>
                  <Text style={[styles.orderBadgeTxt, { color }]}>{estado}</Text>
                </View>
                <Text style={styles.orderTotal}>${(sale.total || 0).toFixed(2)}</Text>
              </View>
            );
          })
        )}
      </View>

      {lowStock.length > 0 && (
        <View style={styles.block}>
          <View style={styles.blockHdr}>
            <Text style={[styles.blockTitle, { color: "#ef4444" }]}>⚠️ Alertas de Stock</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Products")}>
              <Text style={styles.seeAll}>Gestionar →</Text>
            </TouchableOpacity>
          </View>
          {lowStock.slice(0, 5).map(p => (
            <View key={p._id || p.id} style={styles.stockRow}>
              <Ionicons name="cube" size={16} color="#ef4444" />
              <Text style={styles.stockName} numberOfLines={1}>{p.name || p.nombreProducto || "Producto"}</Text>
              <Text style={styles.stockQty}>{p.stock} u.</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 30 },
  greetingWrap:  { marginBottom: 12 },
  greetingLabel: { color: "#66736B", fontSize: 13 },
  greetingName:  { color: "#102B1E", fontSize: 24, fontWeight: "bold" },
  description: { color: "#66736B", fontSize: 14, marginBottom: 18, lineHeight: 21 },

  grid:      { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  card:      { width: "47.5%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.07)", alignItems: "flex-start" },
  cardValue: { color: "#102B1E", fontSize: 22, fontWeight: "bold" },
  cardLabel: { color: "#66736B", fontSize: 12, marginTop: 3 },

  chartCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.07)" },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 8 },
  chartTitle: { color: "#102B1E", fontSize: 16, fontWeight: "700" },
  chartSubtitle: { color: "#68736A", fontSize: 11, marginTop: 4 },
  chartTotalBadge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: "rgba(11, 43, 30, 0.12)" },
  chartTotal: { color: "#208B51", fontSize: 13, fontWeight: "700" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 126, gap: 8 },
  chartColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  chartAmount: { height: 16, color: "#68736A", fontSize: 9, marginBottom: 4 },
  chartTrack: { width: "68%", height: 92, justifyContent: "flex-end", overflow: "hidden", borderRadius: 10, backgroundColor: "rgba(16, 43, 30, 0.035)" },
  chartBar: { width: "100%", borderRadius: 10, backgroundColor: "#0B2B1E" },
  chartDay: { color: "#68736A", fontSize: 10, marginTop: 7, textTransform: "capitalize" },
  reportBanner:   { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(11, 43, 30, 0.08)", borderWidth: 1, borderColor: "rgba(11, 43, 30, 0.3)", borderRadius: 20, padding: 16, gap: 12, marginBottom: 16 },
  reportIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(11, 43, 30, 0.2)", justifyContent: "center", alignItems: "center" },
  reportTitle:    { color: "#102B1E", fontSize: 14, fontWeight: "bold" },
  reportSub:      { color: "#66736B", fontSize: 11, marginTop: 2 },

  block:      { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.07)" },
  blockHdr:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  blockTitle: { color: "#102B1E", fontSize: 16, fontWeight: "600" },
  seeAll:     { color: "#0B2B1E", fontSize: 13 },
  empty:      { color: "#66736B", textAlign: "center", paddingVertical: 10 },

  orderRow:      { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(16, 43, 30, 0.05)", gap: 8 },
  orderId:       { color: "#102B1E", fontWeight: "bold", fontSize: 13, fontFamily: "monospace", width: 60 },
  orderClient:   { flex: 1, color: "#66736B", fontSize: 13 },
  orderBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  orderBadgeTxt: { fontSize: 11, fontWeight: "bold" },
  orderTotal:    { color: "#208B51", fontSize: 13, fontWeight: "bold" },

  stockRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(16, 43, 30, 0.05)" },
  stockName: { flex: 1, color: "#102B1E", fontSize: 14 },
  stockQty:  { color: "#ef4444", fontWeight: "bold", fontSize: 14 },
});

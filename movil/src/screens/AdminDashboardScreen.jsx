import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// importamos el hook useAuth para acceder a los datos de la sesión activa y realizar consultas
import useAuth from "../hooks/useAuth";

const LOW_STOCK_THRESHOLD = 15;

const MetricCard = ({ icon, color, label, value, isAlert }) => {
  return (
    <View style={[styles.card, isAlert && { borderColor: "rgba(239, 68, 68, 0.4)" }]}>
      <View style={[styles.cardIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
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
      const [sales, products, customers] = await Promise.allSettled([
        authFetch("/sales"),
        authFetch("/products"),
        authFetch("/clientes"),
      ]);
      setData({
        sales:     sales.status     === "fulfilled" ? (Array.isArray(sales.value)     ? sales.value     : (sales.value.sales     || [])) : [],
        products:  products.status  === "fulfilled" ? (Array.isArray(products.value)  ? products.value  : (products.value.products  || [])) : [],
        customers: customers.status === "fulfilled" ? (Array.isArray(customers.value) ? customers.value : (customers.value.clientes  || [])) : [],
      });
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#0a0d0f", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#30b466" />
    </View>
  );

  const totalRevenue = data.sales.reduce((acc, s) => acc + (s.total || s.amount || 0), 0);
  const pendingOrders = data.sales.filter(s => ["Pendiente", "En Proceso"].includes(s.estado || s.status)).length;
  const lowStock = data.products.filter(p => (p.stock || 0) <= LOW_STOCK_THRESHOLD);
  const recentSales = data.sales.slice(0, 5);

  const STATUS_COLOR = {
    "Pendiente": "#f59e0b", "En Proceso": "#3b82f6", "Enviado": "#8b5cf6",
    "Entregado": "#10b981", "Completado": "#30b466", "Cancelado": "#ef4444",
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0d0f" }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#30b466" />}
    >
      <View style={styles.greetingWrap}>
        <View>
          <Text style={styles.greetingLabel}>¡Bienvenido de nuevo,</Text>
          <Text style={styles.greetingName}>{user?.name?.split(" ")[0] || "Administrador"} 👋</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Resumen general del estado de tu tienda: ingresos, pedidos activos y alertas de stock en tiempo real.
      </Text>

      <View style={styles.grid}>
        <MetricCard icon="cash" color="#30b466" label="Ventas Totales" value={`$${totalRevenue.toFixed(2)}`} />
        <MetricCard icon="bag" color="#3b82f6" label="Total Pedidos" value={data.sales.length} />
        <MetricCard icon="time" color="#f59e0b" label="Pendientes" value={pendingOrders} />
        <MetricCard icon="warning" color="#ef4444" label="Bajo Stock" value={lowStock.length} isAlert={lowStock.length > 0} />
        <MetricCard icon="people" color="#8b5cf6" label="Clientes" value={data.customers.length} />
        <MetricCard icon="cube" color="#10b981" label="Productos" value={data.products.length} />
      </View>

      <TouchableOpacity
        style={styles.reportBanner}
        onPress={() => navigation.navigate("Reports")}
        activeOpacity={0.85}
      >
        <View style={styles.reportIconWrap}>
          <Ionicons name="document-text" size={22} color="#30b466" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reportTitle}>Generar Reportes Ejecutivos PDF</Text>
          <Text style={styles.reportSub}>Ventas por período, estado de inventario y clientes</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#30b466" />
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
            const color = STATUS_COLOR[estado] || "#888";
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
  greetingLabel: { color: "#888", fontSize: 13 },
  greetingName:  { color: "#fff", fontSize: 24, fontWeight: "bold" },
  description: { color: "#aaa", fontSize: 14, marginBottom: 18, lineHeight: 20 },

  grid:      { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  card:      { width: "47.5%", backgroundColor: "#121619", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", alignItems: "flex-start" },
  cardIcon:  { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  cardValue: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  cardLabel: { color: "#666", fontSize: 12, marginTop: 3 },

  reportBanner:   { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(48, 180, 102, 0.08)", borderWidth: 1, borderColor: "rgba(48, 180, 102, 0.3)", borderRadius: 14, padding: 14, gap: 12, marginBottom: 16 },
  reportIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(48, 180, 102, 0.2)", justifyContent: "center", alignItems: "center" },
  reportTitle:    { color: "#fff", fontSize: 14, fontWeight: "bold" },
  reportSub:      { color: "#888", fontSize: 11, marginTop: 2 },

  block:      { backgroundColor: "#121619", borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  blockHdr:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  blockTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  seeAll:     { color: "#30b466", fontSize: 13 },
  empty:      { color: "#555", textAlign: "center", paddingVertical: 10 },

  orderRow:      { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)", gap: 8 },
  orderId:       { color: "#fff", fontWeight: "bold", fontSize: 13, fontFamily: "monospace", width: 60 },
  orderClient:   { flex: 1, color: "#aaa", fontSize: 13 },
  orderBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  orderBadgeTxt: { fontSize: 11, fontWeight: "bold" },
  orderTotal:    { color: "#4ade80", fontSize: 13, fontWeight: "bold" },

  stockRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)" },
  stockName: { flex: 1, color: "#ccc", fontSize: 14 },
  stockQty:  { color: "#ef4444", fontWeight: "bold", fontSize: 14 },
});

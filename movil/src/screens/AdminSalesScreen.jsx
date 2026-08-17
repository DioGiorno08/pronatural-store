import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// importamos el hook useAuth para realizar consultas y peticiones autenticadas
import useAuth from "../hooks/useAuth";

const ESTADOS = ["Pendiente", "En Proceso", "Enviado", "Entregado", "Completado", "Cancelado"];

const STATUS_COLOR = {
  "Pendiente":  "#f59e0b",
  "En Proceso": "#3b82f6",
  "Enviado":    "#8b5cf6",
  "Entregado":  "#10b981",
  "Completado": "#30b466",
  "Cancelado":  "#ef4444",
};

const SaleDetailModal = ({ visible, sale, onClose, onUpdated }) => {
  const { authFetch } = useAuth();

  const [estado, setEstado] = useState(sale?.estado || sale?.status || "Pendiente");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await authFetch(`/sales/${sale._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: estado }),
      });
      Alert.alert("✅ Estado Actualizado", "El estado de la venta se actualizó correctamente.");
      onUpdated();
      onClose();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!sale) return null;

  const idStr = (sale._id || "").slice(-6).toUpperCase();
  const fecha = new Date(sale.createdAt || sale.fechaVenta || Date.now())
    .toLocaleDateString("es-SV", { year: "numeric", month: "short", day: "numeric" });
  const color = STATUS_COLOR[estado] || "#888";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>Venta #{idStr}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.infoRow}>
              <Ionicons name="person" size={16} color="#888" />
              <Text style={modalStyles.infoTxt}>{sale.customerId?.nombre || sale.cliente?.nombre || "Cliente General"}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Ionicons name="calendar" size={16} color="#888" />
              <Text style={modalStyles.infoTxt}>{fecha}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Ionicons name="cash" size={16} color="#30b466" />
              <Text style={[modalStyles.infoTxt, { color: "#4ade80", fontWeight: "bold" }]}>${(sale.total || 0).toFixed(2)}</Text>
            </View>

            {sale.productos?.length > 0 && (
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>Productos en la Orden</Text>
                {sale.productos.map((p, i) => (
                  <View key={i} style={modalStyles.prodRow}>
                    <Text style={modalStyles.prodName}>{p.nombre || p.name || "Producto"}</Text>
                    <Text style={modalStyles.prodQty}>
                      x{p.cantidad || p.qty || 1} — ${((p.precio || p.price || 0) * (p.cantidad || p.qty || 1)).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={[modalStyles.sectionTitle, { marginTop: 20 }]}>Cambiar Estado</Text>
            <View style={modalStyles.estadosWrap}>
              {ESTADOS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[
                    modalStyles.estadoBtn,
                    {
                      borderColor: e === estado ? STATUS_COLOR[e] : "#333",
                      backgroundColor: e === estado ? `${STATUS_COLOR[e]}20` : "#0d1114",
                    },
                  ]}
                  onPress={() => setEstado(e)}
                >
                  <Text style={[modalStyles.estadoTxt, { color: e === estado ? STATUS_COLOR[e] : "#888" }]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[modalStyles.saveBtn, { backgroundColor: color, opacity: saving ? 0.6 : 1 }]}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.saveTxt}>Guardar Estado</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdminSalesScreen = () => {
  // utilizamos el hook useAuth para llamar al endpoint de ventas
  const { authFetch } = useAuth();

  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState(null);

  const loadSales = async () => {
    try {
      const data = await authFetch("/sales");
      setSales(Array.isArray(data) ? data : (data.sales || data.data || []));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadSales(); }, []));

  const renderItem = ({ item }) => {
    const estado = item.estado || item.status || "Pendiente";
    const color = STATUS_COLOR[estado] || "#888";
    const fecha = new Date(item.createdAt || item.fechaVenta || Date.now()).toLocaleDateString("es-SV");
    const id = (item._id || "").slice(-6).toUpperCase();

    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>#{id}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
            <Text style={[styles.badgeTxt, { color }]}>{estado}</Text>
          </View>
        </View>

        <View style={styles.cardMid}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.clienteTxt}>{item.customerId?.nombre || item.cliente?.nombre || "Cliente General"}</Text>
          <Text style={styles.fechaTxt}>{fecha}</Text>
        </View>

        <View style={styles.cardBot}>
          <Text style={styles.total}>${(item.total || 0).toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#0a0d0f", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#30b466" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0d0f" }}>
      <FlatList
        data={sales}
        keyExtractor={item => item._id || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadSales(); }}
            tintColor="#30b466"
          />
        }
        ListEmptyComponent={
          <Text style={{ color: "#555", textAlign: "center", marginTop: 60 }}>Sin ventas registradas</Text>
        }
      />

      <SaleDetailModal
        visible={!!selected}
        sale={selected}
        onClose={() => setSelected(null)}
        onUpdated={loadSales}
      />
    </View>
  );
};

export default AdminSalesScreen;

const styles = StyleSheet.create({
  card: { backgroundColor: "#121619", borderRadius: 14, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  orderId: { color: "#fff", fontWeight: "bold", fontSize: 16, fontFamily: "monospace" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeTxt: { fontSize: 12, fontWeight: "bold" },
  cardMid: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  clienteTxt: { color: "#aaa", fontSize: 13, flex: 1 },
  fechaTxt: { color: "#555", fontSize: 12 },
  cardBot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.05)", paddingTop: 10 },
  total: { color: "#4ade80", fontSize: 18, fontWeight: "bold" },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#121619", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  hdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)" },
  infoTxt: { color: "#ccc", fontSize: 14 },
  section: { marginTop: 16 },
  sectionTitle: { color: "#888", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  prodRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  prodName: { color: "#ccc", fontSize: 13, flex: 1 },
  prodQty: { color: "#4ade80", fontSize: 13, fontWeight: "bold" },
  estadosWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  estadoBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  estadoTxt: { fontSize: 13, fontWeight: "600" },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 8 },
  saveTxt: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});

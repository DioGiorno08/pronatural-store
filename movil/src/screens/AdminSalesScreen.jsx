import React, { useState, useEffect } from "react";
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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnimatedEntrance from "../components/AnimatedEntrance";
import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";

const ESTADOS = ["Pendiente", "En Proceso", "Enviado", "Entregado", "Completado", "Cancelado"];

const STATUS_COLOR = {
  "Pendiente":  "#f59e0b",
  "En Proceso": "#3b82f6",
  "Enviado":    "#8b5cf6",
  "Entregado":  "#10b981",
  "Completado": "#0B2B1E",
  "Cancelado":  "#ef4444",
};

// MODAL PARA DETALLE Y CAMBIO DE ESTADO DE VENTA
const SaleDetailModal = ({ visible, sale, onClose, onUpdated }) => {
  const { authFetch } = useAuth();

  const [estado, setEstado] = useState(sale?.estado || sale?.status || "Pendiente");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sale) {
      setEstado(sale.estado || sale.status || "Pendiente");
    }
  }, [sale]);

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
  const color = STATUS_COLOR[estado] || "#66736B";

  const orderItems = sale.products || sale.productos || [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>Venta #{idStr}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#66736B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.infoRow}>
              <Ionicons name="person" size={16} color="#66736B" />
              <Text style={modalStyles.infoTxt}>
                {sale.customerId?.nombre || sale.customerId?.name || sale.cliente?.nombre || "Cliente General (Mostrador)"}
              </Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Ionicons name="calendar" size={16} color="#66736B" />
              <Text style={modalStyles.infoTxt}>{fecha}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Ionicons name="card" size={16} color="#66736B" />
              <Text style={modalStyles.infoTxt}>Método: {sale.paymentMethod || "Efectivo"}</Text>
            </View>
            <View style={modalStyles.infoRow}>
              <Ionicons name="cash" size={16} color="#0B2B1E" />
              <Text style={[modalStyles.infoTxt, { color: "#208B51", fontWeight: "bold" }]}>
                Total: ${(sale.total || 0).toFixed(2)}
              </Text>
            </View>

            {orderItems.length > 0 && (
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>Productos en la Orden</Text>
                {orderItems.map((p, i) => {
                  const prodName =
                    p.productId?.nombreProducto ||
                    p.productId?.name ||
                    p.nombre ||
                    p.name ||
                    "Producto";
                  const qty = p.quantity || p.cantidad || p.qty || 1;
                  const price =
                    p.unitPrice !== undefined
                      ? p.unitPrice
                      : p.precio !== undefined
                      ? p.precio
                      : p.price || 0;
                  return (
                    <View key={i} style={modalStyles.prodRow}>
                      <Text style={modalStyles.prodName}>{prodName}</Text>
                      <Text style={modalStyles.prodQty}>
                        x{qty} — ${(price * qty).toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
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
                      borderColor: e === estado ? STATUS_COLOR[e] : "#D9DED8",
                      backgroundColor: e === estado ? `${STATUS_COLOR[e]}20` : "#102B1E",
                    },
                  ]}
                  onPress={() => setEstado(e)}
                >
                  <Text style={[modalStyles.estadoTxt, { color: e === estado ? STATUS_COLOR[e] : "#66736B" }]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[modalStyles.saveBtn, { backgroundColor: color, opacity: saving ? 0.6 : 1 }]}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={modalStyles.saveTxt}>Guardar Estado</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// MODAL PARA REGISTRAR NUEVA VENTA DIRECTA DESDE MÓVIL
const NewSaleModal = ({ visible, onClose, onCreated }) => {
  const { authFetch } = useAuth();

  const [products, setProducts]       = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [selectedCust, setSelCust]   = useState(null);
  const [paymentMethod, setPayMethod] = useState("cash");
  const [cart, setCart]               = useState([]);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
      setCart([]);
      setSelCust(null);
      setPayMethod("cash");
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [resProd, resCust] = await Promise.allSettled([
        authFetch("/products"),
        authFetch("/clientes"),
      ]);
      if (resProd.status === "rejected") throw resProd.reason;
      const productData = resProd.value;
      setProducts(Array.isArray(productData) ? productData : (Array.isArray(productData?.products) ? productData.products : Array.isArray(productData?.data) ? productData.data : []));
      if (resCust.status === "rejected") {
        setCustomers([]);
        Alert.alert("Clientes no disponibles", "Puedes continuar con la venta de mostrador; revisa la conexión para elegir un cliente.");
      } else {
        const customerData = resCust.value;
        setCustomers(Array.isArray(customerData) ? customerData : (Array.isArray(customerData?.clientes) ? customerData.clientes : Array.isArray(customerData?.data) ? customerData.data : []));
      }
    } catch (e) {
      setProducts([]);
      setCustomers([]);
      Alert.alert("No se cargaron los productos", e.message || "Revisa la conexión e inténtalo de nuevo.");
    }
  };

  const addToCart = (product) => {
    const pId = product._id || product.id;
    const price = Number(product.price ?? product.precio);
    const stock = Number(product.stock ?? 0);
    if (!pId || !Number.isFinite(price) || price <= 0) {
      Alert.alert("Producto inválido", "No se puede agregar un producto sin identificador y precio válido.");
      return;
    }
    const existing = cart.find(item => item.id === pId);

    if (existing) {
      if (existing.qty >= stock) {
        Alert.alert("Stock límite", "No hay más existencias disponibles de este producto.");
        return;
      }
      setCart(cart.map(item => item.id === pId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      if (!Number.isSafeInteger(stock) || stock < 1) {
        Alert.alert("Sin existencias", "Este producto no tiene unidades disponibles para la venta.");
        return;
      }
      setCart([...cart, {
        id: pId,
        name: product.name || product.nombreProducto || "Producto",
        price,
        qty: 1,
      }]);
    }
  };

  const removeFromCart = (pId) => {
    const existing = cart.find(item => item.id === pId);
    if (existing.qty > 1) {
      setCart(cart.map(item => item.id === pId ? { ...item, qty: item.qty - 1 } : item));
    } else {
      setCart(cart.filter(item => item.id !== pId));
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSaveSale = async () => {
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Selecciona al menos un producto para registrar la venta.");
      return;
    }

    let latestProducts;
    try {
      const response = await authFetch("/products");
      latestProducts = Array.isArray(response) ? response : response.products || response.data || [];
    } catch (error) {
      Alert.alert("No se pudo verificar el inventario", "Revisa la conexión e inténtalo de nuevo. No se registró la venta.");
      return;
    }

    const unavailable = cart.find((item) => {
      const latest = latestProducts.find((product) => (product._id || product.id) === item.id);
      const stock = Number(latest?.stock ?? 0);
      return !latest || !Number.isSafeInteger(stock) || stock < item.qty;
    });
    if (unavailable) {
      Alert.alert("Inventario actualizado", "Las existencias cambiaron en otra sesión. Actualiza los productos y revisa las cantidades antes de guardar.");
      const refreshed = latestProducts.map((product) => ({
        ...product,
        price: Number(product.price ?? product.precio ?? 0),
      }));
      setProducts(refreshed);
      return;
    }

    setSaving(true);
    try {
      const body = {
        customerId: selectedCust ? (selectedCust._id || selectedCust.id) : null,
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.price,
          subtotal: item.price * item.qty,
        })),
        total,
        paymentMethod,
        status: "Completado",
        notes: "Venta registrada desde app móvil administrativa",
      };

      await authFetch("/sales", {
        method: "POST",
        body: JSON.stringify(body),
      });

      Alert.alert("✅ Venta Exitosa", `Venta registrada por $${total.toFixed(2)} correctamente.`);
      onCreated();
      onClose();
    } catch (e) {
      Alert.alert("Error al registrar venta", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { maxHeight: "92%" }]}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>Registrar Nueva Venta</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#66736B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Selección de Cliente */}
            <Text style={modalStyles.sectionTitle}>Cliente</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={[
                  newSaleStyles.custPill,
                  !selectedCust && newSaleStyles.custPillActive,
                ]}
                onPress={() => setSelCust(null)}
              >
                <Text style={[newSaleStyles.custPillTxt, !selectedCust && newSaleStyles.custPillTxtActive]}>
                  👤 Mostrador (General)
                </Text>
              </TouchableOpacity>
              {customers.slice(0, 10).map(c => {
                const isSel = selectedCust?._id === c._id;
                const cName = c.nombre || c.name || "Cliente";
                return (
                  <TouchableOpacity
                    key={c._id || c.id}
                    style={[newSaleStyles.custPill, isSel && newSaleStyles.custPillActive]}
                    onPress={() => setSelCust(c)}
                  >
                    <Text style={[newSaleStyles.custPillTxt, isSel && newSaleStyles.custPillTxtActive]}>
                      {cName.split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Catálogo rápido de productos */}
            <Text style={modalStyles.sectionTitle}>Agregar Productos</Text>
            <View style={newSaleStyles.prodGrid}>
              {products.map(p => {
                const inCart = cart.find(c => c.id === (p._id || p.id));
                const price = p.price || p.precio || 0;
                return (
                  <TouchableOpacity
                    key={p._id || p.id}
                    style={[newSaleStyles.prodCard, inCart && newSaleStyles.prodCardActive]}
                    onPress={() => addToCart(p)}
                    activeOpacity={0.8}
                  >
                    <Text style={newSaleStyles.prodCardName} numberOfLines={1}>
                      {p.name || p.nombreProducto}
                    </Text>
                    <View style={newSaleStyles.prodCardBottom}>
                      <Text style={newSaleStyles.prodCardPrice}>${price.toFixed(2)}</Text>
                      {inCart ? (
                        <View style={newSaleStyles.cartBadge}>
                          <Text style={newSaleStyles.cartBadgeTxt}>{inCart.qty}</Text>
                        </View>
                      ) : (
                        <Ionicons name="add-circle" size={20} color="#0B2B1E" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Resumen del carrito */}
            <Text style={[modalStyles.sectionTitle, { marginTop: 18 }]}>Artículos a Facturar</Text>
            {cart.length === 0 ? (
              <Text style={{ color: "#66736B", fontSize: 13, marginBottom: 16 }}>
                Ningún producto seleccionado todavía.
              </Text>
            ) : (
              cart.map(item => (
                <View key={item.id} style={newSaleStyles.cartRow}>
                  <Text style={newSaleStyles.cartRowName} numberOfLines={1}>{item.name}</Text>
                  <View style={newSaleStyles.qtyControls}>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={newSaleStyles.qtyBtn}>
                      <Ionicons name="remove" size={14} color="#102B1E" />
                    </TouchableOpacity>
                    <Text style={newSaleStyles.qtyTxt}>{item.qty}</Text>
                    <TouchableOpacity onPress={() => addToCart(item)} style={newSaleStyles.qtyBtn}>
                      <Ionicons name="add" size={14} color="#102B1E" />
                    </TouchableOpacity>
                  </View>
                  <Text style={newSaleStyles.cartRowPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                </View>
              ))
            )}

            {/* Método de Pago */}
            <Text style={[modalStyles.sectionTitle, { marginTop: 14 }]}>Método de Pago</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              {[
                { key: "cash", label: "Efectivo" },
                { key: "transfer", label: "Transferencia" },
                { key: "card", label: "Tarjeta" },
              ].map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    newSaleStyles.payBtn,
                    paymentMethod === m.key && newSaleStyles.payBtnActive,
                  ]}
                  onPress={() => setPayMethod(m.key)}
                >
                  <Text style={[newSaleStyles.payBtnTxt, paymentMethod === m.key && { color: "#0B2B1E" }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Total y Confirmar */}
            <View style={newSaleStyles.totalBox}>
              <Text style={newSaleStyles.totalLabel}>Total a Pagar:</Text>
              <Text style={newSaleStyles.totalAmount}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[modalStyles.saveBtn, { backgroundColor: "#0B2B1E", opacity: saving ? 0.6 : 1 }]}
              onPress={handleSaveSale}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={modalStyles.saveTxt}>Confirmar y Guardar Venta</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdminSalesScreen = () => {
  const { authFetch } = useAuth();

  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState("");
  const [showNewSale, setShowNew]   = useState(false);

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

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const id = (s._id || "").toLowerCase();
    const clientName = (s.customerId?.nombre || s.customerId?.name || s.cliente?.nombre || "").toLowerCase();
    const status = (s.estado || s.status || "").toLowerCase();
    return id.includes(q) || clientName.includes(q) || status.includes(q);
  });

  const renderItem = ({ item, index }) => {
    const estado = item.estado || item.status || "Pendiente";
    const color = STATUS_COLOR[estado] || "#66736B";
    const fecha = new Date(item.createdAt || item.fechaVenta || Date.now()).toLocaleDateString("es-SV");
    const id = (item._id || "").slice(-6).toUpperCase();

    return (
      <AnimatedEntrance delay={index * 30} distance={5} duration={220}>
      <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>#{id}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
            <Text style={[styles.badgeTxt, { color }]}>{estado}</Text>
          </View>
        </View>

        <View style={styles.cardMid}>
          <Ionicons name="person-outline" size={14} color="#66736B" />
          <Text style={styles.clienteTxt}>
            {item.customerId?.nombre || item.customerId?.name || item.cliente?.nombre || "Cliente General (Mostrador)"}
          </Text>
          <Text style={styles.fechaTxt}>{fecha}</Text>
        </View>

        <View style={styles.cardBot}>
          <Text style={styles.total}>${(item.total || 0).toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={18} color="#66736B" />
        </View>
      </TouchableOpacity>
      </AnimatedEntrance>
    );
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F6", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0B2B1E" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F6" }}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color="#66736B" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar entre ${sales.length} ventas...`}
            placeholderTextColor="#66736B"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowNew(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnTxt}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadSales(); }}
            tintColor="#0B2B1E"
          />
        }
        ListEmptyComponent={
          <Text style={{ color: "#66736B", textAlign: "center", marginTop: 60 }}>
            {search ? "No hay ventas que coincidan con la búsqueda." : "Sin ventas registradas"}
          </Text>
        }
      />

      <SaleDetailModal
        visible={!!selected}
        sale={selected}
        onClose={() => setSelected(null)}
        onUpdated={loadSales}
      />

      <NewSaleModal
        visible={showNewSale}
        onClose={() => setShowNew(false)}
        onCreated={loadSales}
      />
    </View>
  );
};

export default AdminSalesScreen;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 43, 30, 0.05)",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F1EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
  },
  searchInput: {
    flex: 1,
    color: "#102B1E",
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2B1E",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 4,
  },
  addBtnTxt: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.08)" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  orderId: { color: "#102B1E", fontWeight: "bold", fontSize: 16, fontFamily: "monospace" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeTxt: { fontSize: 12, fontWeight: "bold" },
  cardMid: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  clienteTxt: { color: "#66736B", fontSize: 13, flex: 1 },
  fechaTxt: { color: "#66736B", fontSize: 12 },
  cardBot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(16, 43, 30, 0.05)", paddingTop: 10 },
  total: { color: "#208B51", fontSize: 18, fontWeight: "bold" },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#F3F1EB", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  hdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#102B1E", fontSize: 18, fontWeight: "bold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(16, 43, 30, 0.05)" },
  infoTxt: { color: "#102B1E", fontSize: 14 },
  section: { marginTop: 16 },
  sectionTitle: { color: "#66736B", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  prodRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  prodName: { color: "#102B1E", fontSize: 13, flex: 1 },
  prodQty: { color: "#208B51", fontSize: 13, fontWeight: "bold" },
  estadosWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  estadoBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  estadoTxt: { fontSize: 13, fontWeight: "600" },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 8 },
  saveTxt: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
});

const newSaleStyles = StyleSheet.create({
  custPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    marginRight: 8,
  },
  custPillActive: {
    borderColor: "#0B2B1E",
    backgroundColor: "rgba(11, 43, 30, 0.15)",
  },
  custPillTxt: { color: "#66736B", fontSize: 12, fontWeight: "600" },
  custPillTxtActive: { color: "#0B2B1E" },
  prodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  prodCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    borderRadius: 10,
    padding: 10,
  },
  prodCardActive: {
    borderColor: "#0B2B1E",
    backgroundColor: "rgba(11, 43, 30, 0.06)",
  },
  prodCardName: { color: "#102B1E", fontSize: 12, fontWeight: "600" },
  prodCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  prodCardPrice: { color: "#208B51", fontSize: 13, fontWeight: "bold" },
  cartBadge: {
    backgroundColor: "#0B2B1E",
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeTxt: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  cartRowName: { flex: 1, color: "#102B1E", fontSize: 13 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 12 },
  qtyBtn: {
    backgroundColor: "#EEF1F4",
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyTxt: { color: "#102B1E", fontWeight: "bold", fontSize: 13 },
  cartRowPrice: { color: "#208B51", fontWeight: "bold", fontSize: 13 },
  payBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  payBtnActive: {
    borderColor: "#0B2B1E",
    backgroundColor: "rgba(11, 43, 30, 0.12)",
  },
  payBtnTxt: { color: "#66736B", fontSize: 12, fontWeight: "600" },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 43, 30, 0.1)",
    marginBottom: 14,
  },
  totalLabel: { color: "#66736B", fontSize: 15, fontWeight: "600" },
  totalAmount: { color: "#208B51", fontSize: 22, fontWeight: "bold" },
});

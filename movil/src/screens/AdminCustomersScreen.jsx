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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// importamos el hook useAuth para las consultas del módulo de clientes
import useAuth from "../hooks/useAuth";

const CustomerDetailModal = ({ visible, customer, onClose }) => {
  if (!customer) return null;

  const name = customer.nombre || customer.name || "Cliente";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>Detalle del Cliente</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.avatarWrap}>
              <View style={modalStyles.avatar}>
                <Text style={modalStyles.avatarTxt}>{initials}</Text>
              </View>
              <Text style={modalStyles.clientName}>{name}</Text>
            </View>

            {[
              { icon: "mail",     label: "Correo Electrónico", val: customer.email || customer.correo },
              { icon: "call",     label: "Teléfono",          val: customer.telefono || customer.phone || "No registrado" },
              { icon: "location", label: "Dirección",         val: customer.direccion || customer.address || "No registrada" },
              {
                icon: "calendar",
                label: "Fecha de Registro",
                val: new Date(customer.createdAt || Date.now())
                  .toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric" }),
              },
            ].map(({ icon, label, val }) => (
              <View key={label} style={modalStyles.row}>
                <Ionicons name={icon} size={18} color="#30b466" style={{ width: 28 }} />
                <View>
                  <Text style={modalStyles.rowLabel}>{label}</Text>
                  <Text style={modalStyles.rowVal}>{val || "—"}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdminCustomersScreen = () => {
  // utilizamos el hook useAuth para hacer llamadas al endpoint /clientes
  const { authFetch } = useAuth();

  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);

  const loadCustomers = async () => {
    try {
      const data = await authFetch("/clientes");
      setCustomers(Array.isArray(data) ? data : (data.clientes || data.data || []));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadCustomers(); }, []));

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (c.nombre || c.name || "").toLowerCase().includes(q) ||
           (c.email || c.correo || "").toLowerCase().includes(q);
  });

  const renderItem = ({ item }) => {
    const name = item.nombre || item.name || "Cliente";
    const email = item.email || item.correo || "";
    const initial = name.charAt(0).toUpperCase();

    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email} numberOfLines={1}>{email}</Text>
          {item.telefono && <Text style={styles.phone}>{item.telefono}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#444" />
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
      <View style={styles.topBar}>
        <Ionicons name="search" size={16} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar entre ${customers.length} clientes...`}
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadCustomers(); }}
            tintColor="#30b466"
          />
        }
        ListEmptyComponent={
          <Text style={{ color: "#555", textAlign: "center", marginTop: 60 }}>Sin clientes registrados</Text>
        }
      />

      <CustomerDetailModal
        visible={!!selected}
        customer={selected}
        onClose={() => setSelected(null)}
      />
    </View>
  );
};

export default AdminCustomersScreen;

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", margin: 15, backgroundColor: "#121619", borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  searchInput: { flex: 1, color: "#fff", paddingVertical: 11, paddingLeft: 10, fontSize: 14 },
  card: { backgroundColor: "#121619", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(48, 180, 102, 0.12)", borderWidth: 1, borderColor: "#30b466", justifyContent: "center", alignItems: "center" },
  avatarTxt: { color: "#30b466", fontSize: 18, fontWeight: "bold" },
  info: { flex: 1, marginLeft: 14 },
  name: { color: "#fff", fontSize: 15, fontWeight: "600" },
  email: { color: "#666", fontSize: 12, marginTop: 2 },
  phone: { color: "#555", fontSize: 12, marginTop: 1 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#121619", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" },
  hdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(48, 180, 102, 0.12)", borderWidth: 2, borderColor: "#30b466", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  avatarTxt: { color: "#30b466", fontSize: 28, fontWeight: "bold" },
  clientName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)" },
  rowLabel: { color: "#555", fontSize: 11, marginBottom: 2 },
  rowVal: { color: "#fff", fontSize: 14 },
});

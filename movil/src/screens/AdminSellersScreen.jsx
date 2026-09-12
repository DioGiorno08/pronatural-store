import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";

const SellerModal = ({ visible, seller, onClose, onSaved }) => {
  const { authFetch } = useAuth();
  const isEdit = !!(seller && (seller.id || seller._id));

  const [name, setName]         = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("Vendedor");
  const [saving, setSaving]     = useState(false);

  React.useEffect(() => {
    if (visible && seller) {
      setName(seller.name || seller.nombre || "");
      setLastName(seller.lastName || seller.apellido || "");
      setEmail(seller.email || seller.correo || "");
      setPhone(seller.phone || seller.telefono || "");
      setRole(seller.role || seller.cargo || "Vendedor");
      setPassword("");
    } else if (visible) {
      setName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("Vendedor");
    }
  }, [visible, seller]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Campos requeridos", "El nombre y el correo son obligatorios.");
      return;
    }

    if (!isEdit && (!password || password.length < 6)) {
      Alert.alert(
        "Contraseña requerida",
        "La contraseña temporal debe tener al menos 6 caracteres."
      );
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        role: role,
        ...(password.trim() ? { password: password.trim() } : {}),
      };

      const targetId = seller ? (seller.id || seller._id) : null;

      if (isEdit && targetId) {
        await authFetch(`/empleados/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Empleado actualizado correctamente.");
      } else {
        await authFetch("/empleados", {
          method: "POST",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Empleado registrado correctamente.");
      }

      onSaved();
      onClose();
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo guardar el empleado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>
              {isEdit ? "Editar Empleado" : "Nuevo Empleado"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Nombre *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Nombre de pila"
                placeholderTextColor="#444"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Apellido</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Apellido"
                placeholderTextColor="#444"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Correo Electrónico *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="empleado@pronatural.com"
                placeholderTextColor="#444"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Número de Teléfono</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="+503 7000-0000"
                placeholderTextColor="#444"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>
                {isEdit ? "Nueva Contraseña (Opcional)" : "Contraseña Temporal *"}
              </Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="••••••••"
                placeholderTextColor="#444"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Rol / Cargo</Text>
              <View style={modalStyles.rolesRow}>
                {["Vendedor", "Admin"].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      modalStyles.roleBtn,
                      role === r && modalStyles.roleBtnActive,
                    ]}
                    onPress={() => setRole(r)}
                  >
                    <Ionicons
                      name={r === "Admin" ? "shield-checkmark" : "person"}
                      size={16}
                      color={role === r ? "#30b466" : "#666"}
                    />
                    <Text
                      style={[
                        modalStyles.roleTxt,
                        role === r && modalStyles.roleTxtActive,
                      ]}
                    >
                      {r === "Admin" ? "Administrador" : "Vendedor"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={modalStyles.btns}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                <Text style={modalStyles.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#0a110d" />
                ) : (
                  <Text style={modalStyles.saveTxt}>
                    {isEdit ? "Guardar Cambios" : "Registrar Empleado"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdminSellersScreen = () => {
  const { authFetch } = useAuth();
  const [sellers, setSellers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const loadSellers = async () => {
    try {
      const data = await authFetch("/empleados");
      const list = Array.isArray(data)
        ? data
        : data.empleados || data.data || [];
      setSellers(list);
    } catch (err) {
      Alert.alert("Error al cargar empleados", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSellers();
    }, [])
  );

  const handleDelete = (item) => {
    const id = item.id || item._id;
    const name = `${item.name || item.nombre || ""} ${item.lastName || item.apellido || ""}`.trim() || "Empleado";

    Alert.alert(
      "¿Eliminar empleado?",
      `Se eliminará a "${name}" del sistema.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await authFetch(`/empleados/${id}`, { method: "DELETE" });
              Alert.alert("✅ Eliminado", "El empleado ha sido removido.");
              loadSellers();
            } catch (err) {
              Alert.alert("Error al eliminar", err.message);
            }
          },
        },
      ]
    );
  };

  const filtered = sellers.filter((s) => {
    const q = search.toLowerCase();
    const fullName = `${s.name || s.nombre || ""} ${s.lastName || s.apellido || ""}`.toLowerCase();
    const email = (s.email || s.correo || "").toLowerCase();
    const phone = (s.phone || s.telefono || "").toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q);
  });

  const renderItem = ({ item }) => {
    const fullName = `${item.name || item.nombre || ""} ${item.lastName || item.apellido || ""}`.trim() || "Empleado";
    const initial = fullName.charAt(0).toUpperCase();
    const roleLabel = item.role === "Admin" || item.cargo === "Admin" ? "Administrador" : "Vendedor";
    const isAdmin = roleLabel === "Administrador";

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, isAdmin && { borderColor: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
            <Text style={[styles.avatarTxt, isAdmin && { color: "#f59e0b" }]}>{initial}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{item.email || item.correo}</Text>
            {item.phone || item.telefono ? (
              <Text style={styles.phone}>{item.phone || item.telefono}</Text>
            ) : null}
          </View>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? "rgba(245, 158, 11, 0.15)" : "rgba(48, 180, 102, 0.15)" }]}>
            <Ionicons
              name={isAdmin ? "shield-checkmark" : "person"}
              size={11}
              color={isAdmin ? "#f59e0b" : "#30b466"}
            />
            <Text style={[styles.roleTxt, { color: isAdmin ? "#f59e0b" : "#30b466" }]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setSelectedSeller(item);
              setModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={16} color="#3b82f6" />
            <Text style={[styles.actionTxt, { color: "#3b82f6" }]}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={[styles.actionTxt, { color: "#ef4444" }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#30b466" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar entre ${sellers.length} empleados...`}
            placeholderTextColor="#444"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setSelectedSeller(null);
            setModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#0a110d" />
          <Text style={styles.addBtnTxt}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadSellers();
            }}
            tintColor="#30b466"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyTxt}>
            {search ? "No se encontraron empleados coincidentes." : "Sin empleados registrados."}
          </Text>
        }
      />

      <SellerModal
        visible={modalVisible}
        seller={selectedSeller}
        onClose={() => setModalVisible(false)}
        onSaved={loadSellers}
      />
    </View>
  );
};

export default AdminSellersScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0d0f" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121619",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#30b466",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 4,
  },
  addBtnTxt: { color: "#0a110d", fontWeight: "bold", fontSize: 14 },
  card: {
    backgroundColor: "#121619",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(48, 180, 102, 0.12)",
    borderWidth: 1,
    borderColor: "#30b466",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTxt: { color: "#30b466", fontSize: 18, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  email: { color: "#888", fontSize: 12, marginTop: 2 },
  phone: { color: "#555", fontSize: 11, marginTop: 1 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleTxt: { fontSize: 10, fontWeight: "bold" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionTxt: { fontSize: 13, fontWeight: "600" },
  emptyTxt: { color: "#666", textAlign: "center", marginTop: 40, fontSize: 14 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#121619",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "88%",
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  field: { marginBottom: 14 },
  lbl: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inp: {
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: "#fff",
    fontSize: 14,
  },
  rolesRow: { flexDirection: "row", gap: 12 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleBtnActive: {
    borderColor: "#30b466",
    backgroundColor: "rgba(48, 180, 102, 0.1)",
  },
  roleTxt: { color: "#888", fontSize: 13, fontWeight: "600" },
  roleTxtActive: { color: "#30b466" },
  btns: { flexDirection: "row", gap: 12, marginTop: 14 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#1c2227",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelTxt: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  saveBtn: {
    flex: 2,
    backgroundColor: "#30b466",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  saveTxt: { color: "#0a110d", fontSize: 14, fontWeight: "bold" },
});

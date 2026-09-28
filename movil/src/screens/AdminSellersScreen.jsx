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
import AnimatedEntrance from "../components/AnimatedEntrance";
import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import { isValidEmail, parseNonNegativeInteger } from "../utils/formValidation";

const SellerModal = ({ visible, seller, onClose, onSaved }) => {
  const { authFetch } = useAuth();
  const isEdit = !!(seller && (seller.id || seller._id));

  const [name, setName]         = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("Vendedor");
  const [salary, setSalary]     = useState("400");
  const [saving, setSaving]     = useState(false);

  React.useEffect(() => {
    if (visible && seller) {
      setName(seller.name || seller.nombre || "");
      setLastName(seller.lastName || seller.apellido || "");
      setEmail(seller.email || seller.correo || "");
      setPhone(seller.phone || seller.telefono || "");
      setRole(seller.role || seller.cargo || "Vendedor");
      setSalary(String(seller.salary || seller.salario || "400"));
      setPassword("");
    } else if (visible) {
      setName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("Vendedor");
      setSalary("400");
    }
  }, [visible, seller]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Campos requeridos", "El nombre y el correo electrónico son obligatorios.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Correo inválido", "Escribe un correo electrónico válido, por ejemplo nombre@dominio.com.");
      return;
    }

    const salaryAmount = parseNonNegativeInteger(salary);
    if (salaryAmount === null) {
      Alert.alert("Salario inválido", "El salario debe ser un número entero igual o mayor que cero.");
      return;
    }

    if (!isEdit && (!password || password.length < 6)) {
      Alert.alert(
        "Contraseña requerida",
        "La contraseña inicial debe tener al menos 6 caracteres."
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
        salary: salaryAmount,
        ...(password.trim() ? { password: password.trim() } : {}),
      };

      const targetId = seller ? (seller.id || seller._id) : null;

      if (isEdit && targetId) {
        await authFetch(`/employees/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Vendedor actualizado correctamente.");
      } else {
        await authFetch("/employees", {
          method: "POST",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Vendedor registrado correctamente.");
      }

      onSaved();
      onClose();
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo guardar el vendedor.");
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
              {isEdit ? "Editar Vendedor" : "Nuevo Vendedor"}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#66736B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Nombre *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Nombre de pila"
                placeholderTextColor="#66736B"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Apellido</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Apellido"
                placeholderTextColor="#66736B"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Correo Electrónico *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="vendedor@pronatural.com"
                placeholderTextColor="#66736B"
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
                placeholderTextColor="#66736B"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>
                {isEdit ? "Nueva Contraseña (Opcional)" : "Contraseña Inicial *"}
              </Text>
              <TextInput
                style={modalStyles.inp}
                placeholder={isEdit ? "Dejar en blanco para mantener" : "Mínimo 6 caracteres"}
                placeholderTextColor="#66736B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Rol / Cargo</Text>
              <View style={modalStyles.roleRow}>
                {["Vendedor", "Administrador"].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      modalStyles.roleOpt,
                      role === r && modalStyles.roleOptActive,
                    ]}
                    onPress={() => setRole(r)}
                  >
                    <Text
                      style={[
                        modalStyles.roleOptTxt,
                        role === r && modalStyles.roleOptTxtActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Salario Mensual ($ USD)</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="400"
                placeholderTextColor="#66736B"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
              />
            </View>

            <TouchableOpacity
              style={modalStyles.saveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={modalStyles.saveBtnTxt}>
                  {isEdit ? "Guardar Cambios" : "Registrar Vendedor"}
                </Text>
              )}
            </TouchableOpacity>
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
  const [editingSeller, setEditingSeller] = useState(null);

  const fetchSellers = async () => {
    try {
      const res = await authFetch("/employees");
      const list = Array.isArray(res) ? res : res.employees || res.empleados || [];
      const normalized = list.map((s) => ({
        id: s.id || s._id,
        name: s.name || s.nombre || "Sin nombre",
        lastName: s.lastName || s.apellido || "",
        email: s.email || s.correo || "",
        phone: s.phone || s.telefono || "No especificado",
        role: s.role || s.cargo || "Vendedor",
        salary: s.salary || s.salario || 0,
      }));
      setSellers(normalized);
    } catch (err) {
      console.warn("Error al cargar vendedores:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSellers();
    }, [])
  );

  const handleDelete = (seller) => {
    Alert.alert(
      "Eliminar Vendedor",
      `¿Estás seguro de eliminar a ${seller.name} ${seller.lastName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await authFetch(`/employees/${seller.id}`, { method: "DELETE" });
              Alert.alert("✅ Eliminado", "Vendedor eliminado correctamente.");
              fetchSellers();
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo eliminar.");
            }
          },
        },
      ]
    );
  };

  const filtered = sellers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const renderSeller = ({ item, index }) => {
    const initials = (item.name[0] || "V") + (item.lastName[0] || "");
    const isAdmin = item.role === "Administrador" || item.role === "Admin";

    return (
      <AnimatedEntrance delay={index * 30} distance={5} duration={220}>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>
              {item.name} {item.lastName}
            </Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <View
                style={[
                  styles.roleBadge,
                  isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeSeller,
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeTxt,
                    isAdmin ? styles.roleBadgeTxtAdmin : styles.roleBadgeTxtSeller,
                  ]}
                >
                  {item.role.toUpperCase()}
                </Text>
              </View>
              {Number(item.salary) > 0 && (
                <Text style={styles.salaryTxt}>${Number(item.salary).toFixed(2)}/mes</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="call-outline" size={13} color="#66736B" />
          <Text style={styles.metaTxt}>{item.phone}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setEditingSeller(item);
              setModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={14} color="#0B2B1E" />
            <Text style={styles.editBtnTxt}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
            <Text style={styles.deleteBtnTxt}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
      </AnimatedEntrance>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Vendedores y Personal</Text>
          <Text style={styles.subtitle}>{sellers.length} empleados registrados</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingSeller(null);
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnTxt}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#66736B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o correo..."
          placeholderTextColor="#66736B"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#66736B" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B2B1E" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSeller}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchSellers();
              }}
              tintColor="#0B2B1E"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={44} color="#66736B" />
              <Text style={styles.emptyTxt}>No hay vendedores registrados aún</Text>
            </View>
          }
        />
      )}

      <SellerModal
        visible={modalVisible}
        seller={editingSeller}
        onClose={() => setModalVisible(false)}
        onSaved={fetchSellers}
      />
    </View>
  );
};

export default AdminSellersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#102B1E" },
  subtitle: { fontSize: 11, color: "#66736B", marginTop: 1 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2B1E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addBtnTxt: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F1EB",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.08)",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#102B1E", height: 40, fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.06)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(11, 43, 30, 0.15)",
    borderWidth: 1.5,
    borderColor: "#0B2B1E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTxt: { color: "#0B2B1E", fontWeight: "bold", fontSize: 15 },
  name: { color: "#102B1E", fontSize: 15, fontWeight: "bold" },
  email: { color: "#66736B", fontSize: 12, marginTop: 1 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleBadgeAdmin: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
  roleBadgeSeller: { backgroundColor: "rgba(11, 43, 30, 0.15)" },
  roleBadgeTxt: { fontSize: 10, fontWeight: "bold" },
  roleBadgeTxtAdmin: { color: "#ef4444" },
  roleBadgeTxtSeller: { color: "#208B51" },
  salaryTxt: { color: "#66736B", fontSize: 12, fontWeight: "500" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 43, 30, 0.04)",
    marginBottom: 10,
  },
  metaTxt: { color: "#66736B", fontSize: 11 },
  actionsRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(11, 43, 30, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(11, 43, 30, 0.25)",
  },
  editBtnTxt: { color: "#208B51", fontSize: 12, fontWeight: "bold" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  deleteBtnTxt: { color: "#ef4444", fontSize: 12, fontWeight: "bold" },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTxt: { color: "#66736B", marginTop: 10, fontSize: 13 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#F5F3ED",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.08)",
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 43, 30, 0.06)",
  },
  title: { color: "#102B1E", fontSize: 17, fontWeight: "bold" },
  field: { marginBottom: 12 },
  lbl: { color: "#66736B", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 5 },
  inp: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    borderRadius: 8,
    color: "#102B1E",
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
  },
  roleRow: { flexDirection: "row", gap: 10 },
  roleOpt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  roleOptActive: {
    backgroundColor: "rgba(11, 43, 30, 0.15)",
    borderColor: "#0B2B1E",
  },
  roleOptTxt: { color: "#66736B", fontSize: 13, fontWeight: "600" },
  roleOptTxtActive: { color: "#208B51", fontWeight: "bold" },
  saveBtn: {
    backgroundColor: "#0B2B1E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  saveBtnTxt: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
});

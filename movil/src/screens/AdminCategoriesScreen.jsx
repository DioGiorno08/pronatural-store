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

const CategoryModal = ({ visible, category, onClose, onSaved }) => {
  const { authFetch } = useAuth();
  const isEdit = !!(category && (category.id || category._id));

  const [nombre, setNombre]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado]           = useState("Activo");
  const [saving, setSaving]           = useState(false);

  React.useEffect(() => {
    if (visible && category) {
      setNombre(category.nombre || category.name || "");
      setDescripcion(category.descripcion || category.description || "");
      setEstado(category.estado || "Activo");
    } else if (visible) {
      setNombre("");
      setDescripcion("");
      setEstado("Activo");
    }
  }, [visible, category]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre de la categoría es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        nombre: nombre.trim(),
        name: nombre.trim(),
        descripcion: descripcion.trim(),
        description: descripcion.trim(),
        estado: estado,
      };

      const targetId = category ? (category.id || category._id) : null;

      if (isEdit && targetId) {
        await authFetch(`/categories/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Categoría actualizada correctamente.");
      } else {
        await authFetch("/categories", {
          method: "POST",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Categoría creada correctamente.");
      }

      onSaved();
      onClose();
    } catch (err) {
      Alert.alert("Error al guardar", err.message || "No se pudo guardar la categoría.");
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
              {isEdit ? "Editar Categoría" : "Nueva Categoría"}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Nombre de Categoría *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Ej. Aceites y Bálsamos, Infusiones..."
                placeholderTextColor="#555"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Descripción</Text>
              <TextInput
                style={[modalStyles.inp, { height: 75, textAlignVertical: "top" }]}
                placeholder="Breve descripción del catálogo o usos..."
                placeholderTextColor="#555"
                multiline
                value={descripcion}
                onChangeText={setDescripcion}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Estado</Text>
              <View style={modalStyles.stateRow}>
                {["Activo", "Inactivo"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      modalStyles.stateOpt,
                      estado === st && modalStyles.stateOptActive,
                    ]}
                    onPress={() => setEstado(st)}
                  >
                    <Text
                      style={[
                        modalStyles.stateOptTxt,
                        estado === st && modalStyles.stateOptTxtActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={modalStyles.saveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#0a110d" size="small" />
              ) : (
                <Text style={modalStyles.saveBtnTxt}>
                  {isEdit ? "Guardar Cambios" : "Crear Categoría"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdminCategoriesScreen = () => {
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCat, setEditingCat]     = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await authFetch("/categories");
      const list = Array.isArray(res) ? res : res.categorias || res.categories || [];
      const normalized = list.map((c) => ({
        id: c.id || c._id,
        nombre: c.nombre || c.name || "Sin nombre",
        descripcion: c.descripcion || c.description || "",
        estado: c.estado || "Activo",
      }));
      setCategories(normalized);
    } catch (err) {
      console.warn("Error al cargar categorías:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleDelete = (cat) => {
    Alert.alert(
      "Eliminar Categoría",
      `¿Estás seguro de eliminar la categoría "${cat.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await authFetch(`/categories/${cat.id}`, { method: "DELETE" });
              Alert.alert("✅ Eliminada", "Categoría eliminada con éxito.");
              fetchCategories();
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo eliminar.");
            }
          },
        },
      ]
    );
  };

  const filtered = categories.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const renderCategory = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.catIdPill}>
          <Text style={styles.catIdTxt}>#{String(item.id).substring(0, 6)}</Text>
        </View>
        <View
          style={[
            styles.badge,
            item.estado === "Inactivo" ? styles.badgeInactive : styles.badgeActive,
          ]}
        >
          <Text
            style={[
              styles.badgeTxt,
              item.estado === "Inactivo" ? styles.badgeTxtInactive : styles.badgeTxtActive,
            ]}
          >
            {item.estado}
          </Text>
        </View>
      </View>

      <Text style={styles.catName}>{item.nombre}</Text>
      {!!item.descripcion && (
        <Text style={styles.catDesc} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            setEditingCat(item);
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={14} color="#30b466" />
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Gestión de Categorías</Text>
          <Text style={styles.subtitle}>
            {categories.length} categorías registradas
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingCat(null);
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#0a110d" />
          <Text style={styles.addBtnTxt}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar categorías..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#30b466" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchCategories();
              }}
              tintColor="#30b466"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="pricetags-outline" size={44} color="#333" />
              <Text style={styles.emptyTxt}>No hay categorías registradas</Text>
            </View>
          }
        />
      )}

      <CategoryModal
        visible={modalVisible}
        category={editingCat}
        onClose={() => setModalVisible(false)}
        onSaved={fetchCategories}
      />
    </View>
  );
};

export default AdminCategoriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0d0f" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 11, color: "#666", marginTop: 1 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#30b466",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addBtnTxt: { color: "#0a110d", fontWeight: "bold", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121619",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#fff", height: 40, fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: "#161b1e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catIdPill: {
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catIdTxt: { color: "#4ade80", fontSize: 11, fontFamily: "monospace", fontWeight: "bold" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeActive: { backgroundColor: "rgba(48, 180, 102, 0.12)" },
  badgeInactive: { backgroundColor: "rgba(239, 68, 68, 0.12)" },
  badgeTxt: { fontSize: 10, fontWeight: "bold" },
  badgeTxtActive: { color: "#4ade80" },
  badgeTxtInactive: { color: "#ef4444" },
  catName: { color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  catDesc: { color: "#888", fontSize: 12, lineHeight: 16, marginBottom: 12 },
  actionsRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(48, 180, 102, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(48, 180, 102, 0.25)",
  },
  editBtnTxt: { color: "#4ade80", fontSize: 12, fontWeight: "bold" },
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
  emptyTxt: { color: "#555", marginTop: 10, fontSize: 13 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#161b1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  title: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  field: { marginBottom: 14 },
  lbl: { color: "#888", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 6 },
  inp: {
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
  },
  stateRow: { flexDirection: "row", gap: 10 },
  stateOpt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#0d1114",
    alignItems: "center",
  },
  stateOptActive: {
    backgroundColor: "rgba(48, 180, 102, 0.15)",
    borderColor: "#30b466",
  },
  stateOptTxt: { color: "#777", fontSize: 13, fontWeight: "600" },
  stateOptTxtActive: { color: "#4ade80", fontWeight: "bold" },
  saveBtn: {
    backgroundColor: "#30b466",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  saveBtnTxt: { color: "#0a110d", fontSize: 14, fontWeight: "bold" },
});

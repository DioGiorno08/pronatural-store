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
  const isEdit = !!(category && (category._id || category.id));

  const [nombre, setNombre]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado]           = useState("Activo");
  const [saving, setSaving]           = useState(false);

  React.useEffect(() => {
    if (visible && category) {
      setNombre(category.nombreCategoria || category.name || "");
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
        nombreCategoria: nombre.trim(),
        descripcion: descripcion.trim(),
        estado: estado,
      };

      const targetId = category ? (category._id || category.id) : null;

      if (isEdit && targetId) {
        await authFetch(`/categorias/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Categoría actualizada correctamente.");
      } else {
        await authFetch("/categorias", {
          method: "POST",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Categoría registrada correctamente.");
      }

      onSaved();
      onClose();
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo guardar la categoría.");
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
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Nombre de la Categoría *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Ej: Aceites y Bálsamos"
                placeholderTextColor="#444"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Descripción</Text>
              <TextInput
                style={[modalStyles.inp, { height: 80, textAlignVertical: "top" }]}
                placeholder="Breve descripción del tipo de productos..."
                placeholderTextColor="#444"
                multiline
                value={descripcion}
                onChangeText={setDescripcion}
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Estado</Text>
              <View style={modalStyles.statusRow}>
                {["Activo", "Inactivo"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      modalStyles.statusBtn,
                      estado === st && modalStyles.statusBtnActive,
                    ]}
                    onPress={() => setEstado(st)}
                  >
                    <Ionicons
                      name={st === "Activo" ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={estado === st ? "#30b466" : "#666"}
                    />
                    <Text
                      style={[
                        modalStyles.statusTxt,
                        estado === st && modalStyles.statusTxtActive,
                      ]}
                    >
                      {st}
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
                    {isEdit ? "Guardar Cambios" : "Crear Categoría"}
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

const AdminCategoriesScreen = () => {
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCat, setSelectedCat]   = useState(null);

  const loadCategories = async () => {
    try {
      const data = await authFetch("/categorias");
      const list = Array.isArray(data)
        ? data
        : data.categories || data.data || [];
      setCategories(list);
    } catch (err) {
      Alert.alert("Error al cargar categorías", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleToggleStatus = async (item) => {
    const id = item._id || item.id;
    try {
      await authFetch(`/categorias/${id}/toggle`, { method: "PATCH" });
      loadCategories();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = (item) => {
    const id = item._id || item.id;
    const name = item.nombreCategoria || item.name || "Categoría";

    Alert.alert(
      "¿Eliminar categoría?",
      `Se eliminará la categoría "${name}". Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await authFetch(`/categorias/${id}`, { method: "DELETE" });
              Alert.alert("✅ Eliminada", "La categoría ha sido eliminada.");
              loadCategories();
            } catch (err) {
              Alert.alert("Error al eliminar", err.message);
            }
          },
        },
      ]
    );
  };

  const filtered = categories.filter((c) => {
    const q = search.toLowerCase();
    const name = (c.nombreCategoria || c.name || "").toLowerCase();
    const desc = (c.descripcion || c.description || "").toLowerCase();
    return name.includes(q) || desc.includes(q);
  });

  const renderItem = ({ item }) => {
    const isActive = (item.estado || "Activo") === "Activo";
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="pricetag" size={18} color="#30b466" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.catName}>{item.nombreCategoria || item.name}</Text>
            {item.descripcion ? (
              <Text style={styles.catDesc} numberOfLines={2}>
                {item.descripcion}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={[
              styles.badgeStatus,
              { backgroundColor: isActive ? "rgba(48, 180, 102, 0.15)" : "rgba(239, 68, 68, 0.15)" },
            ]}
            onPress={() => handleToggleStatus(item)}
          >
            <Text style={[styles.badgeText, { color: isActive ? "#30b466" : "#ef4444" }]}>
              {isActive ? "Activa" : "Inactiva"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setSelectedCat(item);
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
            placeholder={`Buscar entre ${categories.length} categorías...`}
            placeholderTextColor="#444"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setSelectedCat(null);
            setModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#0a110d" />
          <Text style={styles.addBtnTxt}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadCategories();
            }}
            tintColor="#30b466"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyTxt}>
            {search ? "No se encontraron categorías coincidentes." : "No hay categorías registradas en la base de datos."}
          </Text>
        }
      />

      <CategoryModal
        visible={modalVisible}
        category={selectedCat}
        onClose={() => setModalVisible(false)}
        onSaved={loadCategories}
      />
    </View>
  );
};

export default AdminCategoriesScreen;

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
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(48, 180, 102, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  catName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  catDesc: { color: "#888", fontSize: 12, marginTop: 3 },
  badgeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "bold" },
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
    maxHeight: "85%",
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  field: { marginBottom: 16 },
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
  statusRow: { flexDirection: "row", gap: 12 },
  statusBtn: {
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
  statusBtnActive: {
    borderColor: "#30b466",
    backgroundColor: "rgba(48, 180, 102, 0.1)",
  },
  statusTxt: { color: "#888", fontSize: 13, fontWeight: "600" },
  statusTxtActive: { color: "#30b466" },
  btns: { flexDirection: "row", gap: 12, marginTop: 10 },
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

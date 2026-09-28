import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
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
import * as ImagePicker from "expo-image-picker";

// importamos el hook useAuth para realizar las peticiones a la API del servidor
import useAuth from "../hooks/useAuth";
import { parseNonNegativeInteger, parsePositiveAmount } from "../utils/formValidation";

// configuración de Cloudinary para la carga de imágenes de productos
const CLOUD_NAME = "marcoale";
const UPLOAD_PRESET = "pronatural_unsigned";

// función auxiliar para subir una imagen seleccionada a la plataforma Cloudinary
const uploadToCloudinary = async (uri) => {
  const formData = new FormData();
  const filename = uri.split("/").pop();
  const ext = filename.split(".").pop();
  formData.append("file", { uri, name: filename, type: `image/${ext}` });
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error al subir imagen");
  return data.secure_url;
};

// estado inicial del formulario
const EMPTY_FORM = { name: "", price: "", stock: "", category: "", desc: "" };

// componente Modal para crear o actualizar un producto con selector dinámico de categorías
const ProductModal = ({ visible, product, onClose, onSaved, categories = [] }) => {
  const { authFetch } = useAuth();
  const isEdit = !!(product && (product.id || product._id));

  const [form, setForm]         = useState(EMPTY_FORM);
  const [imgUri, setImgUri]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [customCat, setCustomCat] = useState("");
  const [isManualCat, setIsManualCat] = useState(false);

  useEffect(() => {
    if (visible && product) {
      const existingCat = product.category || product.idCategoria || product.categoria || "";
      setForm({
        name:     product.name || product.nombreProducto || product.nombre || "",
        price:    String(product.price !== undefined ? product.price : (product.precio || "")),
        stock:    String(product.stock !== undefined ? product.stock : ""),
        category: existingCat,
        desc:     product.desc || product.descripcion || "",
      });
      setImgUri(product.img || product.imagenProducto || product.imagen || null);
      setIsManualCat(existingCat ? !categories.includes(existingCat) : false);
      setCustomCat(existingCat);
    } else if (visible) {
      const defaultCat = categories.length > 0 ? categories[0] : "";
      setForm({ ...EMPTY_FORM, category: defaultCat });
      setImgUri(null);
      setIsManualCat(false);
      setCustomCat("");
    }
  }, [product, visible, categories]);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permiso requerido", "Se necesita acceso a la galería para seleccionar imágenes.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImgUri(result.assets[0].uri);
  };

  const handleSelectCategory = (cat) => {
    setIsManualCat(false);
    setForm((prev) => ({ ...prev, category: cat }));
  };

  const handleSave = async () => {
    const finalCategory = isManualCat ? customCat.trim() : form.category.trim();

    if (!form.name.trim() || !form.price) {
      Alert.alert("Campos requeridos", "El nombre y el precio son obligatorios.");
      return;
    }

    const price = parsePositiveAmount(form.price);
    const stock = form.stock.trim() === "" ? 0 : parseNonNegativeInteger(form.stock);
    if (price === null) {
      Alert.alert("Precio inválido", "Escribe un precio mayor que cero usando números.");
      return;
    }
    if (stock === null) {
      Alert.alert("Existencias inválidas", "El inventario debe ser un número entero igual o mayor que cero.");
      return;
    }

    if (!finalCategory) {
      Alert.alert("Categoría requerida", "Selecciona una categoría de la lista para el producto.");
      return;
    }

    setSaving(true);
    try {
      let finalImg = isEdit ? (product.img || product.imagenProducto) : undefined;

      if (imgUri && imgUri.startsWith("file://")) {
        finalImg = await uploadToCloudinary(imgUri);
      } else if (imgUri) {
        finalImg = imgUri;
      }

      const body = {
        name: form.name.trim(),
        price,
        stock,
        category: finalCategory,
        desc: form.desc.trim(),
        ...(finalImg ? { img: finalImg } : {}),
      };

      const targetId = product ? (product.id || product._id) : null;

      if (isEdit && targetId) {
        await authFetch(`/products/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Producto actualizado correctamente");
      } else {
        await authFetch("/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
        Alert.alert("✅ Éxito", "Producto registrado correctamente");
      }

      onSaved();
      onClose();
    } catch (e) {
      Alert.alert("Error", e.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>{isEdit ? "Editar Producto" : "Nuevo Producto"}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#66736B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* FOTO DEL PRODUCTO */}
            <TouchableOpacity style={modalStyles.imgBox} onPress={pickImage} activeOpacity={0.8}>
              {imgUri ? (
                <Image source={{ uri: imgUri }} style={modalStyles.imgPreview} />
              ) : (
                <View style={modalStyles.imgPlaceholder}>
                  <Ionicons name="camera" size={30} color="#0B2B1E" />
                  <Text style={modalStyles.imgText}>Seleccionar Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* NOMBRE */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Nombre del Producto *</Text>
              <TextInput
                style={modalStyles.inp}
                placeholder="Ej. Miel de Abeja 500g, Aceite de Romero..."
                placeholderTextColor="#66736B"
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />
            </View>

            {/* PRECIO Y STOCK EN 2 COLUMNAS */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={[modalStyles.field, { flex: 1 }]}>
                <Text style={modalStyles.lbl}>Precio ($ USD) *</Text>
                <TextInput
                  style={modalStyles.inp}
                  placeholder="18.50"
                  placeholderTextColor="#66736B"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
                />
              </View>

              <View style={[modalStyles.field, { flex: 1 }]}>
                <Text style={modalStyles.lbl}>Stock en Inventario</Text>
                <TextInput
                  style={modalStyles.inp}
                  placeholder="50"
                  placeholderTextColor="#66736B"
                  keyboardType="numeric"
                  value={form.stock}
                  onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))}
                />
              </View>
            </View>

            {/* SELECTOR DESPLEGABLE / CHIPS DE CATEGORÍAS REGISTRADAS */}
            <View style={modalStyles.field}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={modalStyles.lbl}>Categoría del Producto *</Text>
                {categories.length > 0 && (
                  <Text style={{ fontSize: 10.5, color: "#0B2B1E", fontWeight: "600" }}>
                    {categories.length} disponibles
                  </Text>
                )}
              </View>

              {/* Lista horizontal/malla de categorías disponibles en la base de datos */}
              <View style={modalStyles.catChipsWrap}>
                {categories.map((cat, idx) => {
                  const isSelected = !isManualCat && form.category === cat;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        modalStyles.catChip,
                        isSelected && modalStyles.catChipActive,
                      ]}
                      onPress={() => handleSelectCategory(cat)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "pricetag-outline"}
                        size={13}
                        color={isSelected ? "#FFFFFF" : "#208B51"}
                      />
                      <Text
                        style={[
                          modalStyles.catChipTxt,
                          isSelected && modalStyles.catChipTxtActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Opción para escribir categoría personalizada */}
                <TouchableOpacity
                  style={[
                    modalStyles.catChip,
                    isManualCat && modalStyles.catChipActive,
                    { borderColor: "rgba(16, 43, 30, 0.15)" },
                  ]}
                  onPress={() => {
                    setIsManualCat(true);
                    setForm((f) => ({ ...f, category: customCat }));
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isManualCat ? "checkmark-circle" : "create-outline"}
                    size={13}
                    color={isManualCat ? "#102B1E" : "#66736B"}
                  />
                  <Text
                    style={[
                      modalStyles.catChipTxt,
                      isManualCat && modalStyles.catChipTxtActive,
                    ]}
                  >
                    + Otra categoría
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input en caso de que elija otra categoría */}
              {isManualCat && (
                <TextInput
                  style={[modalStyles.inp, { marginTop: 8 }]}
                  placeholder="Escribe el nombre de la categoría..."
                  placeholderTextColor="#66736B"
                  value={customCat}
                  onChangeText={(v) => {
                    setCustomCat(v);
                    setForm((f) => ({ ...f, category: v }));
                  }}
                />
              )}
            </View>

            {/* DESCRIPCIÓN */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Descripción del Producto</Text>
              <TextInput
                style={[modalStyles.inp, { height: 75, textAlignVertical: "top" }]}
                placeholder="Descripción detallada, ingredientes, beneficios..."
                placeholderTextColor="#66736B"
                multiline
                value={form.desc}
                onChangeText={(v) => setForm((f) => ({ ...f, desc: v }))}
              />
            </View>

            {/* BOTONES */}
            <View style={modalStyles.btns}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={modalStyles.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={modalStyles.saveTxt}>{isEdit ? "Guardar Cambios" : "Crear Producto"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdminProductsScreen = () => {
  const { authFetch } = useAuth();

  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);

  // Carga paralela de productos y categorías de la base de datos
  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        authFetch("/products"),
        authFetch("/categories"),
      ]);

      setProducts(Array.isArray(prodRes) ? prodRes : Array.isArray(prodRes?.products) ? prodRes.products : Array.isArray(prodRes?.data) ? prodRes.data : []);

      const list = Array.isArray(catRes) ? catRes : Array.isArray(catRes?.categorias) ? catRes.categorias : Array.isArray(catRes?.categories) ? catRes.categories : Array.isArray(catRes?.data) ? catRes.data : [];
      const names = list
        .filter((c) => c.estado !== "Inactivo")
        .map((c) => (c.nombre || c.name || "").trim())
        .filter(Boolean);
      setCategories(names);
    } catch (e) {
      Alert.alert("No se cargó el inventario", e.message || "Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (item) => {
    const targetId = item.id || item._id;
    const name = item.name || item.nombreProducto || "Producto";

    Alert.alert(
      "¿Eliminar producto?",
      `Se eliminará "${name}" permanentemente.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await authFetch(`/products/${targetId}`, { method: "DELETE" });
              loadData();
            } catch (e) {
              Alert.alert("Error", e.message || "No se pudo eliminar.");
            }
          },
        },
      ]
    );
  };

  // Filtro compuesto por barra de búsqueda y categoría seleccionada
  const filtered = products.filter((p) => {
    const name = (p.name || p.nombreProducto || "").toLowerCase();
    const cat = (p.category || p.idCategoria || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = !q || name.includes(q) || cat.includes(q);
    const matchesFilter =
      selectedFilter === "Todos" ||
      cat === selectedFilter.toLowerCase() ||
      cat.includes(selectedFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const renderItem = ({ item, index }) => {
    const name = item.name || item.nombreProducto || "Sin nombre";
    const cat = item.category || item.idCategoria || "Sin categoría";
    const price = item.price !== undefined ? item.price : item.precio || 0;
    const stock = item.stock !== undefined ? item.stock : 0;
    const imgUrl =
      item.img ||
      item.imagenProducto ||
      "https://images.unsplash.com/photo-1587049352851-8d4e89134b3e?w=120";

    return (
      <AnimatedEntrance delay={index * 30} distance={5} duration={220}>
      <View style={styles.card}>
        <Image source={{ uri: imgUrl }} style={styles.img} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.cat}>{cat}</Text>
          <Text style={styles.price}>${parseFloat(price).toFixed(2)}</Text>
        </View>

        <View style={styles.actions}>
          <View
            style={[
              styles.stockBadge,
              {
                backgroundColor:
                  stock <= 15 ? "rgba(239, 68, 68, 0.12)" : "rgba(11, 43, 30, 0.12)",
              },
            ]}
          >
            <Text
              style={[
                styles.stockTxt,
                { color: stock <= 15 ? "#ef4444" : "#0B2B1E" },
              ]}
            >
              {stock} u.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setEditing(item);
              setShowModal(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color="#0B2B1E" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.delBtn}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      </AnimatedEntrance>
    );
  };

  const filterTabs = ["Todos", ...categories];

  return (
    <View style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Catálogo e Inventario</Text>
          <Text style={styles.subtitle}>
            {products.length} productos registrados · {filtered.length} visibles
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditing(null);
            setShowModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnTxt}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#66736B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto por nombre o categoría..."
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

      {/* FILTRO HORIZONTAL DE CATEGORÍAS */}
      {categories.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterTabs.map((cat, idx) => {
              const active = selectedFilter === cat;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.filterTab, active && styles.filterTabActive]}
                  onPress={() => setSelectedFilter(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterTabTxt, active && styles.filterTabTxtActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* LISTA DE PRODUCTOS */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B2B1E" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
              tintColor="#0B2B1E"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={44} color="#66736B" />
              <Text style={styles.emptyTxt}>No se encontraron productos</Text>
            </View>
          }
        />
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      <ProductModal
        visible={showModal}
        product={editing}
        categories={categories}
        onClose={() => setShowModal(false)}
        onSaved={loadData}
      />
    </View>
  );
};

export default AdminProductsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
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
    gap: 4,
  },
  addBtnTxt: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F1EB",
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.08)",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#102B1E", height: 40, fontSize: 13 },
  filterContainer: { marginBottom: 8 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F1EB",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.06)",
  },
  filterTabActive: {
    backgroundColor: "rgba(11, 43, 30, 0.15)",
    borderColor: "#0B2B1E",
  },
  filterTabTxt: { color: "#66736B", fontSize: 12, fontWeight: "600" },
  filterTabTxtActive: { color: "#208B51", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.06)",
  },
  img: { width: 54, height: 54, borderRadius: 8, backgroundColor: "#F5F3ED" },
  info: { flex: 1, marginLeft: 12 },
  name: { color: "#102B1E", fontSize: 14, fontWeight: "bold" },
  cat: { color: "#66736B", fontSize: 11, marginTop: 2 },
  price: { color: "#208B51", fontSize: 14, fontWeight: "bold", marginTop: 4 },
  actions: { alignItems: "flex-end", gap: 6 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stockTxt: { fontSize: 11, fontWeight: "bold" },
  editBtn: {
    padding: 6,
    backgroundColor: "rgba(11, 43, 30, 0.12)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(11, 43, 30, 0.2)",
  },
  delBtn: {
    padding: 6,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
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
    maxHeight: "88%",
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
  imgBox: {
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  imgPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  imgPlaceholder: { alignItems: "center", gap: 4 },
  imgText: { color: "#66736B", fontSize: 11, fontWeight: "600" },
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
  catChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 43, 30, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  catChipActive: {
    backgroundColor: "#0B2B1E",
    borderColor: "#0B2B1E",
  },
  catChipTxt: {
    color: "#208B51",
    fontSize: 12,
    fontWeight: "600",
  },
  catChipTxtActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  btns: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    alignItems: "center",
  },
  cancelTxt: { color: "#66736B", fontSize: 13.5, fontWeight: "bold" },
  saveBtn: {
    flex: 1.5,
    backgroundColor: "#0B2B1E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveTxt: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "bold" },
});

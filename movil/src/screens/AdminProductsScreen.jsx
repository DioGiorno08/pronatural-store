import React, { useState, useEffect } from "react";
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
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

// importamos el hook useAuth para realizar las peticiones a la API del servidor
import useAuth from "../hooks/useAuth";

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

// componente Modal para crear o actualizar un producto
const ProductModal = ({ visible, product, onClose, onSaved }) => {
  const { authFetch } = useAuth();
  const isEdit = !!(product && (product.id || product._id));

  const [form, setForm]     = useState(EMPTY_FORM);
  const [imgUri, setImgUri] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && product) {
      setForm({
        name:     product.name || product.nombreProducto || product.nombre || "",
        price:    String(product.price !== undefined ? product.price : (product.precio || "")),
        stock:    String(product.stock !== undefined ? product.stock : ""),
        category: product.category || product.idCategoria || product.categoria || "",
        desc:     product.desc || product.descripcion || "",
      });
      setImgUri(product.img || product.imagenProducto || product.imagen || null);
    } else if (visible) {
      setForm(EMPTY_FORM);
      setImgUri(null);
    }
  }, [product, visible]);

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

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      Alert.alert("Campos requeridos", "El nombre y el precio son obligatorios.");
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
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        category: form.category.trim(),
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
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: "Nombre del Producto *", key: "name", placeholder: "Miel de Abeja 500g" },
    { label: "Precio ($) *",          key: "price", placeholder: "18.50", kb: "numeric" },
    { label: "Stock Inicial",        key: "stock", placeholder: "50", kb: "numeric" },
    { label: "Categoría",            key: "category", placeholder: "Mieles y Suplementos" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.hdr}>
            <Text style={modalStyles.title}>{isEdit ? "Editar Producto" : "Nuevo Producto"}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={modalStyles.imgBox} onPress={pickImage}>
              {imgUri ? (
                <Image source={{ uri: imgUri }} style={modalStyles.imgPreview} />
              ) : (
                <View style={modalStyles.imgPlaceholder}>
                  <Ionicons name="camera" size={32} color="#30b466" />
                  <Text style={modalStyles.imgText}>Subir Imagen</Text>
                </View>
              )}
            </TouchableOpacity>

            {fields.map(({ label, key, placeholder, kb }) => (
              <View key={key} style={modalStyles.field}>
                <Text style={modalStyles.lbl}>{label}</Text>
                <TextInput
                  style={modalStyles.inp}
                  placeholder={placeholder}
                  placeholderTextColor="#444"
                  keyboardType={kb || "default"}
                  value={form[key]}
                  onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                />
              </View>
            ))}

            <View style={modalStyles.field}>
              <Text style={modalStyles.lbl}>Descripción</Text>
              <TextInput
                style={[modalStyles.inp, { height: 80, textAlignVertical: "top" }]}
                placeholder="Descripción detallada del producto..."
                placeholderTextColor="#444"
                multiline
                value={form.desc}
                onChangeText={v => setForm(f => ({ ...f, desc: v }))}
              />
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
  // utilizamos el hook useAuth para obtener la función authFetch
  const { authFetch } = useAuth();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);

  // función para obtener la lista de productos desde la API del servidor
  const loadProducts = async () => {
    try {
      const data = await authFetch("/products");
      setProducts(Array.isArray(data) ? data : (data.products || data.data || []));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadProducts(); }, []));

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
              loadProducts();
            } catch (e) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  const filtered = products.filter(p => {
    const name = p.name || p.nombreProducto || "";
    const cat = p.category || p.idCategoria || "";
    return name.toLowerCase().includes(search.toLowerCase()) ||
           cat.toLowerCase().includes(search.toLowerCase());
  });

  const renderItem = ({ item }) => {
    const name = item.name || item.nombreProducto || "Sin nombre";
    const cat = item.category || item.idCategoria || "Sin categoría";
    const price = item.price !== undefined ? item.price : (item.precio || 0);
    const stock = item.stock !== undefined ? item.stock : 0;
    const imgUrl = item.img || item.imagenProducto || "https://images.unsplash.com/photo-1587049352851-8d4e89134b3e?w=120";

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: imgUrl }}
          style={styles.img}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.cat}>{cat}</Text>
          <Text style={styles.price}>${parseFloat(price).toFixed(2)}</Text>
        </View>

        <View style={styles.actions}>
          <View style={[styles.stockBadge, { backgroundColor: stock <= 15 ? "rgba(239, 68, 68, 0.12)" : "rgba(48, 180, 102, 0.12)" }]}>
            <Text style={[styles.stockTxt, { color: stock <= 15 ? "#ef4444" : "#30b466" }]}>
              {stock} u.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setEditing(item);
              setShowModal(true);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#30b466" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
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
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor="#444"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditing(null); setShowModal(true); }}>
          <Ionicons name="add" size={22} color="#0a110d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id || item.id || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadProducts(); }}
            tintColor="#30b466"
          />
        }
        ListEmptyComponent={
          <Text style={{ color: "#555", textAlign: "center", marginTop: 60 }}>Sin productos registrados</Text>
        }
      />

      <ProductModal
        visible={showModal}
        product={editing}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSaved={loadProducts}
      />
    </View>
  );
};

export default AdminProductsScreen;

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", padding: 15, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#121619", borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  searchInput: { flex: 1, color: "#fff", paddingVertical: 10, paddingLeft: 8, fontSize: 14 },
  addBtn: { width: 44, height: 44, backgroundColor: "#30b466", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#121619", borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  img: { width: 58, height: 58, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12 },
  name: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cat: { color: "#555", fontSize: 12, marginTop: 2 },
  price: { color: "#4ade80", fontSize: 14, fontWeight: "bold", marginTop: 3 },
  actions: { alignItems: "center", gap: 6 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stockTxt: { fontSize: 11, fontWeight: "bold" },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(48, 180, 102, 0.1)", justifyContent: "center", alignItems: "center" },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#121619", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "92%" },
  hdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  imgBox: { alignSelf: "center", marginBottom: 20 },
  imgPlaceholder: { width: 110, height: 110, borderRadius: 14, borderWidth: 2, borderColor: "rgba(48, 180, 102, 0.25)", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(48, 180, 102, 0.06)" },
  imgPreview: { width: 110, height: 110, borderRadius: 14 },
  imgText: { color: "#30b466", fontSize: 12, marginTop: 6 },
  field: { marginBottom: 14 },
  lbl: { color: "#555", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 },
  inp: { backgroundColor: "#0d1114", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: "#fff", fontSize: 14 },
  btns: { flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 8 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", alignItems: "center" },
  cancelTxt: { color: "#888", fontSize: 14 },
  saveBtn: { flex: 2, paddingVertical: 13, borderRadius: 10, backgroundColor: "#30b466", alignItems: "center" },
  saveTxt: { color: "#0a110d", fontSize: 14, fontWeight: "bold" },
});

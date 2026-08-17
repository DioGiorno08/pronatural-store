import React, { useState } from "react";
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from "react-native";

// importamos los componentes reutilizables CustomCard y CustomInput
import CustomCard from "../components/CustomCard";
import CustomInput from "../components/CustomInput";

// importamos el hook useAuth para obtener el estado de autenticación y consultar la API
import useAuth from "../hooks/useAuth";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = () => {
  const { authFetch } = useAuth();
  const [productos, setProductos] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // función para obtener los datos de los productos desde la API
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await authFetch("/products");
      setProductos(Array.isArray(data) ? data : (data.products || data.data || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadData(); }, []));

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#30b466" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#ef4444" }}>Error al cargar: {error}</Text>
      </View>
    );
  }

  const filteredProducts = productos.filter(p =>
    (p.name || p.nombreProducto || "").toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <CustomCard
      title={item.name || item.nombreProducto}
      subtitle={item.category || item.descripcion}
      imageUrl={item.img || item.imagenProducto}
      price={item.price || item.precio}
      badgeText={`${item.stock || 0} u.`}
      badgeColor={(item.stock || 0) <= 15 ? "#ef4444" : "#30b466"}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogo General de Productos</Text>

      <Text style={styles.description}>
        En esta pantalla se presenta la lista de productos del sistema consumiendo
        datos desde la API del backend mediante el componente FlatList de React Native.
      </Text>

      <CustomInput
        placeholder="Buscar producto..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => (item._id || item.id)?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ color: "#555", textAlign: "center", marginTop: 20 }}>
            No se encontraron productos en la base de datos.
          </Text>
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0d0f",
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
});

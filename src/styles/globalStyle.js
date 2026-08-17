import { StyleSheet } from "react-native";

// Estilos globales reutilizables para componentes y pantallas de la aplicación
const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0d0f",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#121619",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  button: {
    backgroundColor: "#30b466",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#0a110d",
    fontSize: 15,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 15,
    color: "#fff",
  },
});

export default globalStyles;
export { globalStyles };

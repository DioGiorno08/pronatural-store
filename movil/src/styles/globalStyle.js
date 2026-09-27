import { StyleSheet } from "react-native";

// Estilos globales reutilizables para componentes y pantallas de la aplicación
const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#102B1E",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#F3F1EB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  button: {
    backgroundColor: "#0B2B1E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.15)",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 15,
    color: "#102B1E",
  },
});

export default globalStyles;
export { globalStyles };

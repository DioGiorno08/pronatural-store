import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";

// Componente de botón personalizado reutilizable para las acciones principales de la app
const CustomButton = ({ title, onPress, style, textStyle, loading, disabled, variant = "primary" }) => {
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? "#fff" : "#0a110d"} />
      ) : (
        <Text style={[styles.text, isSecondary ? styles.textSecondary : styles.textPrimary, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#30b466",
  },
  buttonSecondary: {
    backgroundColor: "#121619",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 15,
    fontWeight: "bold",
  },
  textPrimary: {
    color: "#0a110d",
  },
  textSecondary: {
    color: "#ccc",
  },
});

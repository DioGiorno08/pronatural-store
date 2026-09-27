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
        <ActivityIndicator color={isSecondary ? "#0B2B1E" : "#FFFFFF"} />
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
    backgroundColor: "#0B2B1E",
  },
  buttonSecondary: {
    backgroundColor: "#F3F1EB",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.15)",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 15,
    fontWeight: "bold",
  },
  textPrimary: {
    color: "#FFFFFF",
  },
  textSecondary: {
    color: "#102B1E",
  },
});

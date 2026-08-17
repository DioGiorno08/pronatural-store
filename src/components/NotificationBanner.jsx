import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Componente de notificación visual (Banner/Toast) reutilizable para mostrar alertas informativas
const NotificationBanner = ({ message, type = "info", visible }) => {
  if (!visible || !message) return null;

  const config = {
    success: { icon: "checkmark-circle",    color: "#30b466", bg: "rgba(48, 180, 102, 0.12)", border: "rgba(48, 180, 102, 0.3)" },
    error:   { icon: "alert-circle",        color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)",  border: "rgba(239, 68, 68, 0.3)" },
    warning: { icon: "warning",             color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" },
    info:    { icon: "information-circle", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)" },
  }[type] || { icon: "information-circle", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)" };

  return (
    <View style={[styles.banner, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={20} color={config.color} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default NotificationBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});

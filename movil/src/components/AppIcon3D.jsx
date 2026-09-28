import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AppIcon3D = ({
  name,
  size = 40,
  iconSize = 20,
  color = "#0B2B1E",
  surface = "#F3F1EB",
  depth = "#D9D5CB",
  radius = 13,
  style,
}) => (
  <View style={[{ width: size + 4, height: size + 4 }, style]} accessible={false}>
    <View
      style={[
        styles.depthLayer,
        { width: size, height: size, borderRadius: radius, backgroundColor: depth },
      ]}
    />
    <View
      style={[
        styles.face,
        { width: size, height: size, borderRadius: radius, backgroundColor: surface },
      ]}
    >
      <Ionicons name={name} size={iconSize} color={color} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  depthLayer: {
    position: "absolute",
    top: 4,
    left: 3,
  },
  face: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.09)",
    shadowColor: "#0B2B1E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AppIcon3D;

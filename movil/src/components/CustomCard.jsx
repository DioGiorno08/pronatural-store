import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

// Custom card reutilizable para mostrar elementos como productos o información del sistema
const CustomCard = ({ title, subtitle, price, imageUrl, badgeText, badgeColor, onPress, style }) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {badgeText && (
            <View style={[styles.badge, { backgroundColor: badgeColor ? `${badgeColor}20` : "#30b46620" }]}>
              <Text style={[styles.badgeText, { color: badgeColor || "#30b466" }]}>{badgeText}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
        {price !== undefined && <Text style={styles.price}>${parseFloat(price).toFixed(2)}</Text>}
      </View>
    </CardWrapper>
  );
};

export default CustomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121619",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  subtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  price: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
});

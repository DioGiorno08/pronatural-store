import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnimatedEntrance from "../components/AnimatedEntrance";

// importamos el logo oficial ProNatural transparente
const logoProNatural = require("../../assets/logopronatural.png");

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <AnimatedEntrance style={styles.header} distance={8} duration={280}>
        <View style={{ backgroundColor: "#0B2B1E", borderRadius: 18, padding: 16 }}>
          <Image source={logoProNatural} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.subTitle}>SISTEMA DE GESTIÓN ADMINISTRATIVA</Text>
      </AnimatedEntrance>

      <Text style={styles.description}>
        En esta pantalla de bienvenida se presentan las funcionalidades principales del sistema administrativo antes de iniciar sesión.
      </Text>

      <AnimatedEntrance style={styles.featuresCard} delay={70} distance={10} duration={300}>
        <View style={styles.featureItem}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(11, 43, 30, 0.15)" }]}>
            <Ionicons name="stats-chart" size={20} color="#0B2B1E" />
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Métricas en Tiempo Real</Text>
            <Text style={styles.featureDesc}>Supervisa ventas, ingresos y pedidos pendientes al instante.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
            <Ionicons name="cube" size={20} color="#3b82f6" />
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Control de Inventario</Text>
            <Text style={styles.featureDesc}>Gestiona productos, stock y alertas de reabastecimiento.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
            <Ionicons name="people" size={20} color="#8b5cf6" />
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Gestión de Clientes</Text>
            <Text style={styles.featureDesc}>Consulta información detallada y contacto de tus clientes.</Text>
          </View>
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={140} distance={8} duration={280}>
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => navigation.replace("Login")}
        activeOpacity={0.85}
      >
        <Text style={styles.continueText}>Ingresar al Portal</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
      </AnimatedEntrance>

      <Text style={styles.footerNote}>Acceso restringido para personal autorizado</Text>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 24,
    justifyContent: "space-between",
    paddingVertical: 50,
  },

  blobTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(11, 43, 30, 0.05)",
  },
  blobBottom: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(27, 67, 50, 0.08)",
  },

  header: {
    alignItems: "center",
    marginTop: 10,
  },
  logoImage: {
    width: 220,
    height: 80,
    marginBottom: 6,
  },
  subTitle: {
    color: "#208B51",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2.5,
    marginTop: 4,
  },
  description: {
    color: "#66736B",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 10,
    lineHeight: 18,
  },

  featuresCard: {
    backgroundColor: "#F3F1EB",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 43, 30, 0.1)",
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    color: "#102B1E",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDesc: {
    color: "#66736B",
    fontSize: 12,
    lineHeight: 17,
  },

  continueBtn: {
    backgroundColor: "#0B2B1E",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  footerNote: {
    color: "#66736B",
    textAlign: "center",
    fontSize: 12,
  },
});

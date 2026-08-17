import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Animated } from "react-native";

// importamos el hook useAuth para consultar el usuario
import useAuth from "../hooks/useAuth";

// importamos la imagen del logo transparente ProNatural
const logoProNatural = require("../../assets/logopronatural.png");

const SplashScreenCustom = ({ navigation, onFinish }) => {
  const { user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    // durar exactamente 1 segundo en pantalla
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (user) {
        navigation.replace("AdminMain");
      } else {
        navigation.replace("Welcome");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, user, onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={logoProNatural} style={styles.logoImage} resizeMode="contain" />

        <Text style={styles.tagline}>PORTAL ADMINISTRATIVO</Text>

        <ActivityIndicator size="large" color="#30b466" style={{ marginTop: 36 }} />
      </Animated.View>

      <Text style={styles.footerText}>ProNatural Store © 2025</Text>
    </View>
  );
};

export default SplashScreenCustom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0d0f",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  bgGlow1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(48, 180, 102, 0.05)",
  },
  bgGlow2: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(27, 67, 50, 0.08)",
  },

  content: {
    alignItems: "center",
  },

  logoImage: {
    width: 260,
    height: 110,
    marginBottom: 8,
  },

  tagline: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 3.5,
    marginTop: 4,
  },

  footerText: {
    position: "absolute",
    bottom: 30,
    color: "#444444",
    fontSize: 12,
  },
});

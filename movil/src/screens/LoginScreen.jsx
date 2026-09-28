import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnimatedEntrance from "../components/AnimatedEntrance";

// importamos el hook useAuth para manejar el inicio de sesión
import useAuth from "../hooks/useAuth";

// importamos el logo oficial ProNatural transparente
const logoProNatural = require("../../assets/logopronatural.png");

const LoginScreen = ({ navigation }) => {
  // estados para controlar los valores de los inputs del formulario
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  // obtenemos la función de login desde el contexto de autenticación
  const { login } = useAuth();

  // función para procesar las credenciales ingresadas al dar click en acceder
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert("Error de inicio de sesión", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <AnimatedEntrance style={styles.logoWrap} distance={8} duration={280}>
          <View style={{ backgroundColor: "#0B2B1E", borderRadius: 18, padding: 16 }}>
            <Image source={logoProNatural} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.tagline}>PORTAL ADMINISTRATIVO</Text>
        </AnimatedEntrance>

        <AnimatedEntrance style={styles.card} delay={70} distance={12} duration={300}>
          <Text style={styles.heading}>Iniciar Sesión</Text>

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@pronatural.com"
            placeholderTextColor="#66736B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor="#66736B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(v => !v)}
            >
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#66736B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>Acceder al Portal</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotTxt}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </AnimatedEntrance>

        <Text style={styles.foot}>ProNatural Admin · Solo para personal autorizado</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAF9F6" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },

  blob1: { position: "absolute", top: -100, right: -80, width: 350, height: 350, borderRadius: 175, backgroundColor: "rgba(11, 43, 30, 0.03)" },
  blob2: { position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(27, 67, 50, 0.06)" },

  logoWrap:  { alignItems: "center", marginBottom: 28 },
  logoImage: { width: 220, height: 80, marginBottom: 4 },
  tagline:   { color: "#208B51", fontSize: 11, fontWeight: "bold", letterSpacing: 3.5, marginTop: 4 },

  card:    { backgroundColor: "#F3F1EB", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.1)" },
  heading: { color: "#102B1E", fontSize: 20, fontWeight: "600", marginBottom: 24 },
  label:   { color: "#66736B", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  input:   { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.15)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, color: "#102B1E", fontSize: 15, marginBottom: 18 },

  passRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  eyeBtn:  { width: 48, height: 48, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.15)", borderRadius: 10, justifyContent: "center", alignItems: "center" },

  btn:     { backgroundColor: "#0B2B1E", paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },

  forgotLink: { alignItems: "center", marginTop: 16 },
  forgotTxt:  { color: "#0B2B1E", fontSize: 14 },

  foot: { color: "#66736B", textAlign: "center", marginTop: 28, fontSize: 12 },
});

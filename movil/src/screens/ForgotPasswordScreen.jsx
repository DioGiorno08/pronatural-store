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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// URL base para consultar los endpoints de recuperación del servidor
const API = "http://172.20.10.3:4000/api";

const ForgotPasswordScreen = ({ navigation }) => {
  // estados para gestionar los pasos del flujo de recuperación
  const [step, setStep]               = useState(1);
  const [email, setEmail]             = useState("");
  const [code, setCode]               = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);

  // paso 1: solicitar código de verificación por correo
  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/recoveryAdmin/requestCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert("📧 Código enviado", "Revisa tu correo electrónico. El código expira en 15 minutos.");
        setStep(2);
      } else {
        Alert.alert("Error", data.message || "No se pudo enviar el código de recuperación.");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  // paso 2: verificar el código recibido
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Campo requerido", "Ingresa el código de verificación.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/recoveryAdmin/verifyCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        Alert.alert("Código incorrecto", data.message || "El código no es válido.");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  // paso 3: guardar la nueva contraseña
  const handleNewPassword = async () => {
    if (!newPass || !confirmPass) {
      Alert.alert("Campo requerido", "Por favor completa ambos campos.");
      return;
    }
    if (newPass.length < 8) {
      Alert.alert("Contraseña débil", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("No coinciden", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/recoveryAdmin/newPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code, newPassword: newPass }),
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          "✅ Contraseña actualizada",
          "Tu contraseña ha sido restablecida. Inicia sesión con la nueva contraseña.",
          [{ text: "Ir al Login", onPress: () => navigation.replace("Login") }]
        );
      } else {
        Alert.alert("Error", data.message || "No se pudo actualizar la contraseña.");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 1) return (
      <>
        <Text style={styles.stepHint}>
          Ingresa tu correo de administrador para enviarte un código de recuperación.
        </Text>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@pronatural.com"
          placeholderTextColor="#444"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleRequestCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a110d" />
          ) : (
            <Text style={styles.btnTxt}>Enviar Código de Verificación</Text>
          )}
        </TouchableOpacity>
      </>
    );

    if (step === 2) return (
      <>
        <Text style={styles.stepHint}>
          Ingresa el código que enviamos a <Text style={{ color: "#30b466" }}>{email}</Text>
        </Text>
        <Text style={styles.label}>Código de 6 dígitos</Text>
        <TextInput
          style={[styles.input, { letterSpacing: 8, textAlign: "center", fontSize: 22 }]}
          placeholder="000000"
          placeholderTextColor="#444"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleVerifyCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a110d" />
          ) : (
            <Text style={styles.btnTxt}>Verificar Código</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => setStep(1)}>
          <Text style={styles.linkTxt}>← Cambiar correo</Text>
        </TouchableOpacity>
      </>
    );

    if (step === 3) return (
      <>
        <Text style={styles.stepHint}>
          Ingresa tu nueva contraseña segura de al menos 8 caracteres.
        </Text>
        <Text style={styles.label}>Nueva Contraseña</Text>
        <View style={styles.passRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry={!showPass}
            value={newPass}
            onChangeText={setNewPass}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
            <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Confirmar Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#444"
          secureTextEntry={!showPass}
          value={confirmPass}
          onChangeText={setConfirmPass}
        />
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleNewPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a110d" />
          ) : (
            <Text style={styles.btnTxt}>Guardar Nueva Contraseña</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  const stepLabel = ["Recuperar Cuenta", "Verificar Código", "Nueva Contraseña"][step - 1];
  const stepColor = ["#f59e0b", "#3b82f6", "#30b466"][step - 1];

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.stepsRow}>
          {[1, 2, 3].map(n => (
            <View key={n} style={[styles.stepDot, { backgroundColor: n <= step ? stepColor : "#222" }]}>
              {n < step ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <Text style={{ color: n <= step ? "#fff" : "#555", fontSize: 12, fontWeight: "bold" }}>{n}</Text>
              )}
            </View>
          ))}
          <View style={[styles.stepLine, { backgroundColor: step >= 2 ? stepColor : "#222" }]} />
          <View style={[styles.stepLine, { backgroundColor: step >= 3 ? stepColor : "#222", left: "64%" }]} />
        </View>

        <View style={styles.logoCircle}>
          <Ionicons name="lock-closed" size={28} color={stepColor} />
        </View>
        <Text style={styles.title}>{stepLabel}</Text>

        <Text style={styles.description}>
          En esta pantalla se realiza el proceso de recuperación de contraseña de administrador en 3 sencillos pasos.
        </Text>

        <View style={styles.card}>
          {renderStep()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0d0f" },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  back:   { position: "absolute", top: 52, left: 24, zIndex: 10 },

  stepsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24, position: "relative" },
  stepDot:  { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", zIndex: 1, marginHorizontal: 20 },
  stepLine: { position: "absolute", height: 2, width: "28%", top: 13, left: "18%" },

  logoCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: "rgba(48, 180, 102, 0.1)", borderWidth: 1.5, borderColor: "rgba(48, 180, 102, 0.3)", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 16 },
  title:      { color: "#fff", fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  description: { color: "#aaa", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 18 },

  card:     { backgroundColor: "#121619", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  stepHint: { color: "#888", fontSize: 14, lineHeight: 22, marginBottom: 24 },
  label:    { color: "#555", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  input:    { backgroundColor: "#0d1114", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, color: "#fff", fontSize: 15, marginBottom: 18 },

  passRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 0 },
  eyeBtn:  { width: 48, height: 48, backgroundColor: "#0d1114", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: 10, justifyContent: "center", alignItems: "center" },

  btn:    { backgroundColor: "#30b466", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 8 },
  btnTxt: { color: "#0a110d", fontSize: 15, fontWeight: "bold" },

  link:    { alignItems: "center", marginTop: 16 },
  linkTxt: { color: "#30b466", fontSize: 14 },
});

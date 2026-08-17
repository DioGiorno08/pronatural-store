import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// importamos el hook useAuth para acceder a los datos de perfil y la función de cierre de sesión
import useAuth from "../hooks/useAuth";

const Section = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
};

const InfoRow = ({ icon, label, value }) => {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#30b466" style={{ width: 28 }} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
};

const ProfileScreen = () => {
  // utilizamos el hook useAuth para obtener el usuario activo y las funciones de sesión
  const { user, logout, authFetch } = useAuth();

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd]       = useState("");
  const [newPwd, setNewPwd]               = useState("");
  const [confirmPwd, setConfirmPwd]       = useState("");
  const [savingPwd, setSavingPwd]         = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Deseas cerrar sesión en este dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      Alert.alert("Campos requeridos", "Completa todos los campos.");
      return;
    }
    if (newPwd.length < 8) {
      Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("No coinciden", "Las contraseñas nuevas no coinciden.");
      return;
    }

    setSavingPwd(true);
    try {
      await authFetch("/auth/changePassword", {
        method: "POST",
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      Alert.alert("✅ Listo", "Contraseña actualizada. Se envió un correo de confirmación.");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setShowChangePwd(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const roleLabel = user?.role === "Admin"
    ? "Administrador"
    : user?.role === "Employee"
    ? "Empleado"
    : "Usuario";

  const initials = (user?.name || "A")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0d0f" }} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || "Administrador"}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#30b466" />
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        En esta pantalla puedes consultar tu información de usuario, modificar tu clave de acceso o cerrar sesión en la aplicación.
      </Text>

      <Section title="Información de Cuenta">
        <InfoRow icon="person"  label="Nombre completo"     value={user?.name} />
        <InfoRow icon="mail"    label="Correo electrónico"  value={user?.email} />
        <InfoRow icon="key"     label="Tipo de cuenta"      value={roleLabel} />
      </Section>

      <Section title="Seguridad">
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowChangePwd(v => !v)}>
          <Ionicons name="lock-closed-outline" size={18} color="#30b466" />
          <Text style={styles.toggleTxt}>Cambiar Contraseña</Text>
          <Ionicons name={showChangePwd ? "chevron-up" : "chevron-down"} size={16} color="#555" />
        </TouchableOpacity>

        {showChangePwd && (
          <View style={styles.pwdForm}>
            {[
              { label: "Contraseña Actual",         val: currentPwd, setter: setCurrentPwd },
              { label: "Nueva Contraseña",           val: newPwd,     setter: setNewPwd },
              { label: "Confirmar Nueva Contraseña", val: confirmPwd, setter: setConfirmPwd },
            ].map(({ label, val, setter }) => (
              <View key={label}>
                <Text style={styles.pwdLabel}>{label}</Text>
                <TextInput
                  style={styles.pwdInput}
                  placeholder="••••••••"
                  placeholderTextColor="#444"
                  secureTextEntry
                  value={val}
                  onChangeText={setter}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, savingPwd && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={savingPwd}
            >
              {savingPwd ? (
                <ActivityIndicator color="#0a110d" />
              ) : (
                <Text style={styles.saveBtnTxt}>Actualizar Contraseña</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Section>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutTxt}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ProNatural Admin v1.0 · © 2025</Text>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  header:     { alignItems: "center", paddingVertical: 20 },
  avatar:     { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(48, 180, 102, 0.12)", borderWidth: 2, borderColor: "#30b466", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  avatarText: { color: "#30b466", fontSize: 32, fontWeight: "bold" },
  name:       { color: "#fff", fontSize: 22, fontWeight: "bold" },
  roleBadge:  { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(48, 180, 102, 0.15)", borderWidth: 1, borderColor: "rgba(48, 180, 102, 0.4)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  roleText:   { color: "#4ade80", fontSize: 13, fontWeight: "600" },
  description: { color: "#aaa", fontSize: 13, textAlign: "center", marginBottom: 20, lineHeight: 18 },

  section:      { marginBottom: 20 },
  sectionTitle: { color: "#555", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  sectionCard:  { backgroundColor: "#121619", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", overflow: "hidden" },

  infoRow:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)" },
  infoLabel: { color: "#555", fontSize: 11, marginBottom: 2 },
  infoValue: { color: "#fff", fontSize: 15, fontWeight: "500" },

  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  toggleTxt: { color: "#fff", fontSize: 15, fontWeight: "500", flex: 1 },

  pwdForm:  { padding: 16, paddingTop: 0, gap: 8 },
  pwdLabel: { color: "#555", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 10 },
  pwdInput: { backgroundColor: "#0d1114", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: "#fff", fontSize: 14 },
  saveBtn:  { backgroundColor: "#30b466", paddingVertical: 13, borderRadius: 10, alignItems: "center", marginTop: 14 },
  saveBtnTxt: { color: "#0a110d", fontSize: 14, fontWeight: "bold" },

  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(239, 68, 68, 0.08)", borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)", borderRadius: 14, padding: 16, marginBottom: 20 },
  logoutTxt: { color: "#ef4444", fontSize: 15, fontWeight: "bold" },

  version: { color: "#333", textAlign: "center", fontSize: 12 },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth";
import {
  DEFAULT_CLOUD_URL,
  DEFAULT_LOCAL_URL,
  testApiConnection,
} from "../config/apiConfig";

const AdminSettingsScreen = () => {
  const { authFetch, apiUrl, changeApiUrl, restoreDefaultApiUrl } = useAuth();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [sendingReport, setSending] = useState(false);
  const [testingPing, setTesting]   = useState(false);
  const [pingResult, setPingResult] = useState(null);

  // Estados del formulario de ajustes
  const [storeName, setStoreName]       = useState("ProNatural Store");
  const [minStock, setMinStock]         = useState("15");
  const [notifEmail, setNotifEmail]     = useState("");
  const [currency, setCurrency]         = useState("USD ($)");

  // Estado del selector de URL de backend
  const [customUrl, setCustomUrl]       = useState(apiUrl || DEFAULT_LOCAL_URL);

  useEffect(() => {
    if (apiUrl) setCustomUrl(apiUrl);
  }, [apiUrl]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await authFetch("/ajustes");
      if (data) {
        if (data.nombreTienda) setStoreName(data.nombreTienda);
        if (data.stockMinimoAlerta !== undefined) setMinStock(String(data.stockMinimoAlerta));
        if (data.correoNotificaciones) setNotifEmail(data.correoNotificaciones);
        if (data.moneda) setCurrency(data.moneda);
      }
    } catch (err) {
      console.warn("No se pudo cargar ajustes de la API:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await authFetch("/ajustes", {
        method: "PUT",
        body: JSON.stringify({
          nombreTienda: storeName.trim(),
          stockMinimoAlerta: parseInt(minStock) || 15,
          correoNotificaciones: notifEmail.trim(),
          moneda: currency.trim(),
        }),
      });
      Alert.alert("✅ Ajustes Guardados", "La configuración de la tienda ha sido actualizada.");
    } catch (err) {
      Alert.alert("Error al guardar", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyUrl = async (target) => {
    const urlToSet = target || customUrl;
    if (!urlToSet.trim()) {
      Alert.alert("URL requerida", "Ingresa una dirección de servidor válida.");
      return;
    }
    try {
      await changeApiUrl(urlToSet.trim());
      setCustomUrl(urlToSet.trim());
      Alert.alert(
        "✅ Servidor Actualizado",
        `La app ahora se conecta a:\n${urlToSet.trim()}`
      );
      handlePing(urlToSet.trim());
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handlePing = async (target) => {
    setTesting(true);
    setPingResult(null);
    try {
      const res = await testApiConnection(target || customUrl);
      setPingResult(res);
    } catch (err) {
      setPingResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSendEmailReport = async () => {
    setSending(true);
    try {
      await authFetch("/ajustes/send-report", { method: "POST" });
      Alert.alert(
        "📧 Reporte Enviado",
        "El informe de inventario ha sido generado en PDF y enviado por correo."
      );
    } catch (err) {
      Alert.alert("Error al enviar reporte", err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Text style={styles.description}>
        Gestiona los parámetros del negocio, umbrales de inventario y la conexión del servidor para garantizar el funcionamiento del APK.
      </Text>

      {/* SECCIÓN 1: CONECTIVIDAD DEL SERVIDOR */}
      <View style={styles.card}>
        <View style={styles.cardHdr}>
          <Ionicons name="server-outline" size={20} color="#30b466" />
          <Text style={styles.cardTitle}>Conectividad del Backend</Text>
        </View>

        <Text style={styles.label}>URL Base de la API</Text>
        <TextInput
          style={styles.input}
          value={customUrl}
          onChangeText={setCustomUrl}
          placeholder="http://192.168.1.10:4000/api"
          placeholderTextColor="#444"
          autoCapitalize="none"
        />

        <View style={styles.presetRow}>
          <TouchableOpacity
            style={[styles.presetBtn, customUrl === DEFAULT_CLOUD_URL && styles.presetActive]}
            onPress={() => handleApplyUrl(DEFAULT_CLOUD_URL)}
          >
            <Ionicons name="cloud-outline" size={14} color="#38bdf8" />
            <Text style={styles.presetTxt}>Producción (Render)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, customUrl === DEFAULT_LOCAL_URL && styles.presetActive]}
            onPress={() => handleApplyUrl(DEFAULT_LOCAL_URL)}
          >
            <Ionicons name="wifi-outline" size={14} color="#a78bfa" />
            <Text style={styles.presetTxt}>Red Local</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => handleApplyUrl()}
          >
            <Text style={styles.applyBtnTxt}>Aplicar URL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pingBtn, testingPing && { opacity: 0.6 }]}
            onPress={() => handlePing()}
            disabled={testingPing}
          >
            {testingPing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="pulse" size={16} color="#30b466" />
                <Text style={styles.pingBtnTxt}>Probar Ping</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {pingResult && (
          <View
            style={[
              styles.pingFeedback,
              {
                backgroundColor: pingResult.success
                  ? "rgba(48, 180, 102, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                borderColor: pingResult.success ? "#30b466" : "#ef4444",
              },
            ]}
          >
            <Ionicons
              name={pingResult.success ? "checkmark-circle" : "alert-circle"}
              size={18}
              color={pingResult.success ? "#30b466" : "#ef4444"}
            />
            <Text
              style={[
                styles.pingText,
                { color: pingResult.success ? "#4ade80" : "#ef4444" },
              ]}
            >
              {pingResult.message}
            </Text>
          </View>
        )}
      </View>

      {/* SECCIÓN 2: PARÁMETROS DEL NEGOCIO */}
      <View style={styles.card}>
        <View style={styles.cardHdr}>
          <Ionicons name="storefront-outline" size={20} color="#30b466" />
          <Text style={styles.cardTitle}>Parámetros de la Tienda</Text>
        </View>

        <Text style={styles.label}>Nombre Comercial</Text>
        <TextInput
          style={styles.input}
          value={storeName}
          onChangeText={setStoreName}
          placeholder="ProNatural Store"
          placeholderTextColor="#444"
        />

        <Text style={styles.label}>Umbral de Alerta de Bajo Stock</Text>
        <TextInput
          style={styles.input}
          value={minStock}
          onChangeText={setMinStock}
          keyboardType="numeric"
          placeholder="15"
          placeholderTextColor="#444"
        />

        <Text style={styles.label}>Correo de Notificaciones</Text>
        <TextInput
          style={styles.input}
          value={notifEmail}
          onChangeText={setNotifEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="administracion@pronatural.com"
          placeholderTextColor="#444"
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#0a110d" />
          ) : (
            <Text style={styles.saveBtnTxt}>Guardar Parámetros</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SECCIÓN 3: ACCIONES RÁPIDAS DEL SISTEMA */}
      <View style={styles.card}>
        <View style={styles.cardHdr}>
          <Ionicons name="flash-outline" size={20} color="#30b466" />
          <Text style={styles.cardTitle}>Acciones Ejecutivas</Text>
        </View>

        <TouchableOpacity
          style={[styles.reportActionBtn, sendingReport && { opacity: 0.6 }]}
          onPress={handleSendEmailReport}
          disabled={sendingReport}
        >
          <View style={styles.reportIcon}>
            <Ionicons name="mail" size={20} color="#30b466" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportBtnTitle}>Enviar Informe de Inventario</Text>
            <Text style={styles.reportBtnSub}>
              Genera y envía un reporte actualizado al correo registrado
            </Text>
          </View>
          {sendingReport ? (
            <ActivityIndicator color="#30b466" size="small" />
          ) : (
            <Ionicons name="chevron-forward" size={18} color="#666" />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0d0f" },
  scroll: { padding: 16, paddingBottom: 40 },
  description: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#121619",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardHdr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  label: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: "#fff",
    fontSize: 14,
    marginBottom: 14,
  },
  presetRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  presetBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 9,
    borderRadius: 8,
  },
  presetActive: {
    borderColor: "#30b466",
    backgroundColor: "rgba(48, 180, 102, 0.1)",
  },
  presetTxt: { color: "#aaa", fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  applyBtn: {
    flex: 1,
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  applyBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "600" },
  pingBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(48, 180, 102, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(48, 180, 102, 0.3)",
    paddingVertical: 12,
    borderRadius: 10,
  },
  pingBtnTxt: { color: "#30b466", fontSize: 13, fontWeight: "bold" },
  pingFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  pingText: { fontSize: 12, fontWeight: "600", flex: 1 },
  saveBtn: {
    backgroundColor: "#30b466",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnTxt: { color: "#0a110d", fontSize: 14, fontWeight: "bold" },
  reportActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  reportIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(48, 180, 102, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportBtnTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  reportBtnSub: { color: "#777", fontSize: 11, marginTop: 2 },
});

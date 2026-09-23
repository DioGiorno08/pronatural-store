import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth";
import {
  DEFAULT_CLOUD_URL,
  DEFAULT_LOCAL_URL,
  getApiBaseUrl,
  testApiConnection,
} from "../config/apiConfig";

const AdminSettingsScreen = () => {
  const { authFetch, changeApiUrl, restoreDefaultApiUrl } = useAuth();

  // Estados de configuración de tienda
  const [storeName, setStoreName]   = useState("ProNatural Store");
  const [minStock, setMinStock]     = useState("15");
  const [notifEmail, setNotifEmail] = useState("admin@pronatural.com");
  const [currency, setCurrency]     = useState("USD ($)");
  const [saving, setSaving]         = useState(false);
  const [sending, setSending]       = useState(false);

  // Estados de conectividad del backend
  const [customUrl, setCustomUrl]   = useState("");
  const [testing, setTesting]       = useState(false);
  const [pingResult, setPingResult] = useState(null);

  // Modal de seguridad para cambio de servidor (Contraseña obligatoria: PRONATURALDEV)
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [devPassword, setDevPassword]           = useState("");
  const [pendingTargetUrl, setPendingTargetUrl] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentUrl = await getApiBaseUrl();
        setCustomUrl(currentUrl);

        const res = await authFetch("/ajustes");
        if (res) {
          if (res.nombreTienda) setStoreName(res.nombreTienda);
          if (res.stockMinimoAlerta) setMinStock(String(res.stockMinimoAlerta));
          if (res.correoNotificaciones) setNotifEmail(res.correoNotificaciones);
          if (res.moneda) setCurrency(res.moneda);
        }
      } catch (err) {
        console.warn("No se pudieron cargar ajustes remotos:", err.message);
      }
    };
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
      Alert.alert("✅ Ajustes Guardados", "La configuración de la tienda ha sido actualizada en la base de datos.");
    } catch (err) {
      Alert.alert("Error al guardar", err.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  // Solicita la contraseña de desarrollador antes de cambiar la URL
  const requestChangeUrl = (target) => {
    const urlToSet = target || customUrl;
    if (!urlToSet || !urlToSet.trim()) {
      Alert.alert("URL requerida", "Ingresa una dirección de servidor válida.");
      return;
    }
    setPendingTargetUrl(urlToSet.trim());
    setDevPassword("");
    setAuthModalVisible(true);
  };

  // Valida la clave fija PRONATURALDEV y aplica el cambio
  const confirmChangeUrl = async () => {
    if (devPassword !== "PRONATURALDEV") {
      Alert.alert(
        "🔒 Acceso Denegado",
        "La contraseña de desarrollador es incorrecta. No se aplicó ningún cambio."
      );
      return;
    }

    setAuthModalVisible(false);
    try {
      await changeApiUrl(pendingTargetUrl);
      setCustomUrl(pendingTargetUrl);
      Alert.alert(
        "✅ Servidor Actualizado",
        `La app ahora se conecta a:\n${pendingTargetUrl}`
      );
      handlePing(pendingTargetUrl);
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo actualizar el servidor.");
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
        "El informe de inventario ha sido generado en PDF y enviado por correo a los administradores."
      );
    } catch (err) {
      Alert.alert("Error al enviar reporte", err.message || "El servicio de correo no respondió.");
    } finally {
      setSending(false);
    }
  };

  const isCloud = customUrl.includes("onrender.com");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Text style={styles.description}>
        Configura los parámetros del sistema, la conectividad del servidor y los reportes de inventario.
      </Text>

      {/* SECCIÓN 1: CONECTIVIDAD DEL SERVIDOR (PROTEGIDA CON PRONATURALDEV) */}
      <View style={styles.card}>
        <View style={styles.cardHdr}>
          <Ionicons name="server-outline" size={20} color="#30b466" />
          <Text style={styles.cardTitle}>Conectividad del Backend</Text>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={10} color="#30b466" />
            <Text style={styles.securityBadgeTxt}>PROTEGIDO</Text>
          </View>
        </View>

        <Text style={styles.cardDesc}>
          Modificar el servidor requiere autorización de desarrollador.
        </Text>

        {/* Estado actual de conexión */}
        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isCloud ? "#30b466" : "#f59e0b" },
              ]}
            />
            <Text style={styles.statusLabel}>
              {isCloud ? "Nube Oficial HTTPS (Render)" : "Servidor Local / Personalizado"}
            </Text>
          </View>
          <Text style={styles.statusUrl} numberOfLines={1}>
            {customUrl || "No configurada"}
          </Text>
        </View>

        {/* Botones de cambio rápido */}
        <View style={styles.quickBtnsRow}>
          <TouchableOpacity
            style={[styles.quickBtn, isCloud && styles.quickBtnActive]}
            onPress={() => requestChangeUrl(DEFAULT_CLOUD_URL)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cloud-outline"
              size={14}
              color={isCloud ? "#30b466" : "#888"}
            />
            <Text
              style={[
                styles.quickBtnTxt,
                isCloud && styles.quickBtnTxtActive,
              ]}
            >
              Nube (Render)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, !isCloud && styles.quickBtnActive]}
            onPress={() => requestChangeUrl(DEFAULT_LOCAL_URL)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="laptop-outline"
              size={14}
              color={!isCloud ? "#30b466" : "#888"}
            />
            <Text
              style={[
                styles.quickBtnTxt,
                !isCloud && styles.quickBtnTxtActive,
              ]}
            >
              Local (PC)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input manual de URL */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Dirección URL del Backend</Text>
          <View style={styles.urlInputRow}>
            <TextInput
              style={styles.urlInput}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="https://tu-servidor.com/api"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => requestChangeUrl(customUrl)}
              activeOpacity={0.8}
            >
              <Ionicons name="key-outline" size={14} color="#0a110d" />
              <Text style={styles.applyBtnTxt}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Ping / Prueba de Latencia */}
        <TouchableOpacity
          style={styles.pingBtn}
          onPress={() => handlePing(customUrl)}
          disabled={testing}
          activeOpacity={0.8}
        >
          {testing ? (
            <ActivityIndicator size="small" color="#4ade80" />
          ) : (
            <>
              <Ionicons name="pulse-outline" size={16} color="#4ade80" />
              <Text style={styles.pingBtnTxt}>Probar Conexión (Ping)</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resultado del Ping con explicación de latencia */}
        {pingResult && (
          <View
            style={[
              styles.pingBox,
              pingResult.success ? styles.pingBoxSuccess : styles.pingBoxError,
            ]}
          >
            <Ionicons
              name={pingResult.success ? "checkmark-circle" : "close-circle"}
              size={18}
              color={pingResult.success ? "#30b466" : "#ef4444"}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.pingMsg,
                  { color: pingResult.success ? "#4ade80" : "#ef4444" },
                ]}
              >
                {pingResult.message}
              </Text>
              {pingResult.latency !== undefined && (
                <Text style={styles.pingDetail}>
                  Latencia RTT: {pingResult.latency} ms {isCloud ? "(Nube Render · EE.UU. a Centroamérica con TLS)" : "(Red Local LAN)"}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* SECCIÓN 2: AJUSTES DE TIENDA */}
      <View style={styles.card}>
        <View style={styles.cardHdr}>
          <Ionicons name="storefront-outline" size={20} color="#30b466" />
          <Text style={styles.cardTitle}>Parámetros de la Tienda</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre de la Tienda</Text>
          <TextInput
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="ProNatural Store"
            placeholderTextColor="#555"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Umbral de Stock Mínimo (Alerta)</Text>
          <TextInput
            style={styles.input}
            value={minStock}
            onChangeText={setMinStock}
            keyboardType="numeric"
            placeholder="15"
            placeholderTextColor="#555"
          />
          <Text style={styles.fieldHint}>
            Productos con stock igual o menor a esta cifra activarán alertas críticas en el panel.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Correo de Notificaciones</Text>
          <TextInput
            style={styles.input}
            value={notifEmail}
            onChangeText={setNotifEmail}
            keyboardType="email-address"
            placeholder="admin@pronatural.com"
            placeholderTextColor="#555"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Moneda de Operación</Text>
          <TextInput
            style={styles.input}
            value={currency}
            onChangeText={setCurrency}
            placeholder="USD ($)"
            placeholderTextColor="#555"
          />
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveSettings}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#0a110d" size="small" />
          ) : (
            <Text style={styles.saveBtnTxt}>Guardar Ajustes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SECCIÓN 3: ACCIONES DE ADMINISTRADOR */}
      <View style={styles.card}>
        <View style={styles.cardHdr}>
          <Ionicons name="mail-outline" size={20} color="#30b466" />
          <Text style={styles.cardTitle}>Reportes Automáticos por Correo</Text>
        </View>

        <Text style={styles.cardDesc}>
          Envía el informe ejecutivo de stock y métricas a los correos configurados.
        </Text>

        <TouchableOpacity
          style={styles.reportBtn}
          onPress={handleSendEmailReport}
          disabled={sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator color="#4ade80" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={15} color="#4ade80" />
              <Text style={styles.reportBtnTxt}>Enviar Reporte de Inventario Ahora</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL DE SEGURIDAD (CONTRASENA PRONATURALDEV) */}
      <Modal
        visible={authModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="shield-checkmark" size={28} color="#30b466" />
            </View>

            <Text style={styles.modalTitle}>Autorización de Desarrollador</Text>
            <Text style={styles.modalSub}>
              Para cambiar la conectividad del backend a:
            </Text>
            <Text style={styles.modalTargetUrl} numberOfLines={2}>
              {pendingTargetUrl}
            </Text>

            <Text style={styles.modalInputLabel}>Ingresa la contraseña maestra:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña requerida"
              placeholderTextColor="#555"
              secureTextEntry={true}
              autoCapitalize="characters"
              value={devPassword}
              onChangeText={setDevPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAuthModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnTxt}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmChangeUrl}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnTxt}>Verificar y Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0d0f" },
  scroll: { padding: 16, paddingBottom: 40 },
  description: {
    color: "#888",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#161b1e",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHdr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(48,180,102,0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  securityBadgeTxt: {
    color: "#30b466",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: "#666",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  statusBox: {
    backgroundColor: "#121619",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { color: "#fff", fontSize: 13, fontWeight: "600" },
  statusUrl: { color: "#888", fontSize: 11, fontFamily: "monospace" },
  quickBtnsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#121619",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickBtnActive: {
    backgroundColor: "rgba(48,180,102,0.12)",
    borderColor: "rgba(48,180,102,0.3)",
  },
  quickBtnTxt: { color: "#777", fontSize: 12, fontWeight: "600" },
  quickBtnTxtActive: { color: "#4ade80", fontWeight: "bold" },
  field: { marginBottom: 12 },
  fieldLabel: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  fieldHint: { color: "#555", fontSize: 10.5, marginTop: 4 },
  input: {
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
  },
  urlInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#30b466",
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
  },
  applyBtnTxt: { color: "#0a110d", fontWeight: "bold", fontSize: 12 },
  pingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(48,180,102,0.08)",
    borderWidth: 1,
    borderColor: "rgba(48,180,102,0.2)",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  pingBtnTxt: { color: "#4ade80", fontSize: 12, fontWeight: "bold" },
  pingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  pingBoxSuccess: { backgroundColor: "rgba(48,180,102,0.1)" },
  pingBoxError: { backgroundColor: "rgba(239,68,68,0.1)" },
  pingMsg: { fontSize: 12, fontWeight: "bold" },
  pingDetail: { color: "#888", fontSize: 10, marginTop: 2 },
  saveBtn: {
    backgroundColor: "#30b466",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  saveBtnTxt: { color: "#0a110d", fontSize: 13.5, fontWeight: "bold" },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(48,180,102,0.1)",
    borderWidth: 1,
    borderColor: "rgba(48,180,102,0.25)",
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportBtnTxt: { color: "#4ade80", fontSize: 13, fontWeight: "bold" },

  // Modal de autorización
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#161b1e",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  modalIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(48,180,102,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSub: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
  },
  modalTargetUrl: {
    color: "#4ade80",
    fontSize: 11,
    fontFamily: "monospace",
    textAlign: "center",
    backgroundColor: "#0d1114",
    padding: 6,
    borderRadius: 6,
    marginVertical: 10,
    width: "100%",
  },
  modalInputLabel: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#0d1114",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  modalCancelBtnTxt: { color: "#888", fontSize: 13, fontWeight: "bold" },
  modalConfirmBtn: {
    flex: 1.4,
    backgroundColor: "#30b466",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmBtnTxt: { color: "#0a110d", fontSize: 13, fontWeight: "bold" },
});

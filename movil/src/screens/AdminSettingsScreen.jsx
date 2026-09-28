import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth";
import { isValidEmail, normalizeApiUrl } from "../utils/formValidation";

const TABS = [
  { id: "profile", label: "Perfil" },
  { id: "store", label: "Tienda" },
  { id: "security", label: "Seguridad" },
  { id: "notifications", label: "Notificaciones" },
];

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DEFAULT_CONFIG = {
  storeName: "Pro Natural",
  ruc: "",
  email: "info@pronatural.com",
  phone: "+503 2222-2222",
  address: "San Salvador, El Salvador",
  website: "https://pronatural.com",
  whatsapp: "50369674467",
  mapUrl: "",
  instagram: "@pronatural",
  facebook: "fb.com/pronatural",
  tiktok: "@pronatural",
  youtube: "youtube.com/@pronatural",
  taxRate: 0,
  deliveryFee: 3.5,
  metas: { diaria: 150, semanal: 1050, mensual: 4500 },
  notificaciones: { enabled: true, lowStock: true, outOfStock: true },
  reporteSemanal: { enabled: false, dia: 1, hora: 8, minuto: 0 },
};

const extractMapUrl = (value) => {
  if (typeof value !== "string") return "";
  const match = value.match(/src=["']([^"']+)["']/i);
  return match?.[1] || value.trim();
};

const parseNonNegativeNumber = (value) => {
  const amount = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const SettingSection = ({ title, description, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const SettingField = ({ label, value, onChangeText, placeholder, keyboardType, multiline, secureTextEntry, editable = true }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput, !editable && styles.disabledInput]}
      value={value == null ? "" : String(value)}
      onChangeText={onChangeText}
      placeholder={placeholder || ""}
      placeholderTextColor="#69736d"
      keyboardType={keyboardType || "default"}
      autoCapitalize={keyboardType === "email-address" || keyboardType === "url" ? "none" : "sentences"}
      autoCorrect={keyboardType !== "email-address" && keyboardType !== "url"}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      editable={editable}
      textAlignVertical={multiline ? "top" : "center"}
    />
  </View>
);

const ToggleRow = ({ title, description, value, disabled, onPress }) => (
  <TouchableOpacity
    style={styles.toggleRow}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    accessibilityRole="switch"
    accessibilityState={{ checked: !!value, disabled: !!disabled }}
  >
    <View style={styles.toggleCopy}>
      <Text style={styles.toggleTitle}>{title}</Text>
      {!!description && <Text style={styles.toggleDescription}>{description}</Text>}
    </View>
    <View style={[styles.switchTrack, value && styles.switchTrackActive, disabled && styles.disabledSwitch]}>
      <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
    </View>
  </TouchableOpacity>
);

const AdminSettingsScreen = () => {
  const { user, authFetch, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [settingsAvailable, setSettingsAvailable] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    setProfile({ name: user?.name || "", phone: user?.phone || "" });
  }, [user]);

  useEffect(() => {
    let isActive = true;
    const loadSettings = async () => {
      setLoading(true);
      const [settingsResult, profileResult] = await Promise.allSettled([
        authFetch("/ajustes"),
        authFetch("/auth/profile"),
      ]);

      if (isActive && settingsResult.status === "fulfilled") {
        const remote = settingsResult.value || {};
        setSettingsAvailable(true);
        setConfig({
          ...DEFAULT_CONFIG,
          ...remote,
          mapUrl: extractMapUrl(remote.mapUrl || ""),
          metas: { ...DEFAULT_CONFIG.metas, ...(remote.metas || {}) },
          notificaciones: { ...DEFAULT_CONFIG.notificaciones, ...(remote.notificaciones || {}) },
          reporteSemanal: { ...DEFAULT_CONFIG.reporteSemanal, ...(remote.reporteSemanal || {}) },
        });
      } else if (isActive && settingsResult.status === "rejected") {
        setSettingsAvailable(false);
        Alert.alert("No se cargaron los ajustes", settingsResult.reason?.message || "Comprueba la conexión e inténtalo de nuevo.");
      }

      if (isActive && profileResult.status === "fulfilled" && profileResult.value) {
        setProfile({ name: profileResult.value.name || user?.name || "", phone: profileResult.value.phone || user?.phone || "" });
      }
      if (isActive) setLoading(false);
    };

    loadSettings();
    return () => { isActive = false; };
  }, []);

  const persistConfig = async (nextConfig) => {
    if (!settingsAvailable) {
      throw new Error("No se cargaron los ajustes del servidor. Vuelve a abrir esta pantalla antes de guardar.");
    }
    const response = await authFetch("/ajustes", {
      method: "PUT",
      body: JSON.stringify(nextConfig),
    });
    const savedConfig = response.ajustes || nextConfig;
    setConfig({
      ...DEFAULT_CONFIG,
      ...savedConfig,
      metas: { ...DEFAULT_CONFIG.metas, ...(savedConfig.metas || {}) },
      notificaciones: { ...DEFAULT_CONFIG.notificaciones, ...(savedConfig.notificaciones || {}) },
      reporteSemanal: { ...DEFAULT_CONFIG.reporteSemanal, ...(savedConfig.reporteSemanal || {}) },
    });
  };

  const handleSaveProfile = async () => {
    const name = profile.name.trim();
    if (name.length < 2) {
      Alert.alert("Nombre inválido", "Escribe tu nombre completo (al menos 2 caracteres).");
      return;
    }
    setSavingProfile(true);
    try {
      const response = await updateUserProfile({ name, phone: profile.phone.trim() });
      if (response.user) setProfile({ name: response.user.name || name, phone: response.user.phone || profile.phone.trim() });
      setIsEditingProfile(false);
      Alert.alert("Perfil actualizado", "Tu nombre y teléfono se guardaron correctamente.");
    } catch (error) {
      Alert.alert("No se actualizó el perfil", error.message || "Inténtalo de nuevo.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveStore = async () => {
    const storeName = config.storeName.trim();
    const taxRate = parseNonNegativeNumber(config.taxRate);
    const deliveryFee = parseNonNegativeNumber(config.deliveryFee);
    const goals = {
      diaria: parseNonNegativeNumber(config.metas.diaria),
      semanal: parseNonNegativeNumber(config.metas.semanal),
      mensual: parseNonNegativeNumber(config.metas.mensual),
    };

    if (storeName.length < 2) {
      Alert.alert("Nombre inválido", "El nombre de la tienda debe tener al menos 2 caracteres.");
      return;
    }
    if (!isValidEmail(config.email)) {
      Alert.alert("Correo inválido", "Escribe un correo válido para la tienda.");
      return;
    }
    if (taxRate === null || taxRate > 100) {
      Alert.alert("Impuesto inválido", "La tasa debe estar entre 0 % y 100 %.");
      return;
    }
    if (deliveryFee === null || Object.values(goals).some((value) => value === null)) {
      Alert.alert("Cantidad inválida", "El costo de envío y las metas deben ser números iguales o mayores que cero.");
      return;
    }
    for (const field of ["website", "mapUrl"]) {
      const value = field === "mapUrl" ? extractMapUrl(config[field]) : String(config[field] || "").trim();
      if (value && !normalizeApiUrl(value)) {
        Alert.alert("Enlace inválido", `Revisa el campo ${field === "website" ? "Sitio web" : "Enlace del mapa"}; debe comenzar con http:// o https://.`);
        return;
      }
    }

    const nextConfig = {
      ...config,
      storeName,
      email: config.email.trim().toLowerCase(),
      phone: config.phone.trim(),
      address: config.address.trim(),
      mapUrl: extractMapUrl(config.mapUrl),
      website: String(config.website || "").trim(),
      whatsapp: config.whatsapp.trim(),
      taxRate,
      deliveryFee,
      metas: goals,
    };
    setSavingStore(true);
    try {
      await persistConfig(nextConfig);
      Alert.alert("Ajustes guardados", "La información de la tienda se actualizó para el sistema.");
    } catch (error) {
      Alert.alert("No se guardaron los ajustes", error.message || "Inténtalo de nuevo.");
    } finally {
      setSavingStore(false);
    }
  };

  const saveConfigChange = async (nextConfig, setBusy = () => {}) => {
    const previousConfig = config;
    setConfig(nextConfig);
    setBusy(true);
    try {
      await persistConfig(nextConfig);
    } catch (error) {
      setConfig(previousConfig);
      Alert.alert("No se guardó el cambio", error.message || "Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword) {
      Alert.alert("Falta la contraseña actual", "Ingresa tu contraseña actual para continuar.");
      return;
    }
    if (passwords.newPassword.length < 6) {
      Alert.alert("Contraseña muy corta", "La contraseña nueva debe tener al menos 6 caracteres.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert("Las contraseñas no coinciden", "Confirma la misma contraseña nueva en ambos campos.");
      return;
    }
    setSavingPassword(true);
    try {
      const response = await authFetch("/auth/changePassword", {
        method: "POST",
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      Alert.alert("Contraseña actualizada", response.message || "Se guardó el cambio y se envió una notificación al correo de la cuenta.");
    } catch (error) {
      Alert.alert("No se cambió la contraseña", error.message || "Comprueba la contraseña actual e inténtalo de nuevo.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleReportScheduleChange = (field, value) => {
    const schedule = { ...config.reporteSemanal, [field]: value };
    const day = Number(schedule.dia);
    const hour = Number(schedule.hora);
    const minute = Number(schedule.minuto);
    if (!Number.isInteger(day) || day < 0 || day > 6 || !Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      Alert.alert("Horario inválido", "Selecciona un día válido y usa una hora entre 0 y 23 y minutos entre 0 y 59.");
      return;
    }
    const nextConfig = {
      ...config,
      reporteSemanal: { ...schedule, dia: day, hora, minuto },
    };
    saveConfigChange(nextConfig, setSavingReport);
  };

  const handleSaveReportTime = () => {
    const hour = Number(config.reporteSemanal.hora);
    const minute = Number(config.reporteSemanal.minuto);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      Alert.alert("Horario inválido", "Usa una hora entre 0 y 23 y minutos entre 0 y 59.");
      return;
    }
    const nextConfig = {
      ...config,
      reporteSemanal: { ...config.reporteSemanal, hora, minuto },
    };
    saveConfigChange(nextConfig, setSavingReport);
  };

  const handleSendInventoryReport = async () => {
    setSendingReport(true);
    try {
      const result = await authFetch("/ajustes/send-report", { method: "POST" });
      Alert.alert("Reporte enviado", result.message || `El reporte de inventario se envió al correo ${user?.email || "administrativo"}.`);
    } catch (error) {
      Alert.alert("No se envió el reporte", error.message || "El servidor no pudo generar el reporte.");
    } finally {
      setSendingReport(false);
    }
  };

  const renderProfileTab = () => (
    <>
      <SettingSection title="Tu perfil" description="Información personal y rol dentro del sistema.">
        <View style={styles.profileSummary}>
          <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(user?.name || "A").charAt(0).toUpperCase()}</Text></View>
          <View style={styles.profileIdentity}>
            <Text style={styles.profileName}>{user?.name || "Administrador"}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
            <Text style={styles.rolePill}>{user?.role === "Employee" ? "Vendedor" : "Administrador"}</Text>
          </View>
          {!isEditingProfile && <TouchableOpacity onPress={() => setIsEditingProfile(true)} style={styles.editIconButton} accessibilityLabel="Editar perfil"><Ionicons name="create-outline" size={19} color="#208B51" /></TouchableOpacity>}
        </View>
        <SettingField label="Nombre completo" value={profile.name} onChangeText={(name) => setProfile((current) => ({ ...current, name }))} editable={isEditingProfile} placeholder="Tu nombre completo" />
        <SettingField label="Correo electrónico" value={user?.email || ""} editable={false} />
        <SettingField label="Teléfono" value={profile.phone} onChangeText={(phone) => setProfile((current) => ({ ...current, phone }))} editable={isEditingProfile} placeholder="+503 7000 0000" keyboardType="phone-pad" />
        <SettingField label="Cargo / rol" value={user?.role === "Employee" ? "Empleado / Vendedor" : "Administrador"} editable={false} />
        {isEditingProfile && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => { setIsEditingProfile(false); setProfile({ name: user?.name || "", phone: user?.phone || "" }); }}><Text style={styles.secondaryButtonText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={savingProfile}>{savingProfile ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Guardar perfil</Text>}</TouchableOpacity>
          </View>
        )}
      </SettingSection>
    </>
  );

  const renderStoreTab = () => (
    <>
      <SettingSection title="Datos de la empresa" description="Información que aparece en la tienda y los recibos.">
        <SettingField label="Nombre de la tienda" value={config.storeName} onChangeText={(value) => setConfig((current) => ({ ...current, storeName: value }))} />
        <SettingField label="RUC / NIT" value={config.ruc} onChangeText={(value) => setConfig((current) => ({ ...current, ruc: value }))} placeholder="0614-XXXXXX-XXX-X" />
        <SettingField label="Correo de contacto" value={config.email} onChangeText={(value) => setConfig((current) => ({ ...current, email: value }))} keyboardType="email-address" />
        <SettingField label="Teléfono de contacto" value={config.phone} onChangeText={(value) => setConfig((current) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
        <SettingField label="Dirección física" value={config.address} onChangeText={(value) => setConfig((current) => ({ ...current, address: value }))} multiline />
        <SettingField label="Enlace del mapa (Google Maps)" value={config.mapUrl} onChangeText={(value) => setConfig((current) => ({ ...current, mapUrl: value }))} placeholder="https://www.google.com/maps/embed?..." />
        <SettingField label="Sitio web" value={config.website} onChangeText={(value) => setConfig((current) => ({ ...current, website: value }))} placeholder="https://pronatural.com" keyboardType="url" />
        <SettingField label="WhatsApp Business" value={config.whatsapp} onChangeText={(value) => setConfig((current) => ({ ...current, whatsapp: value }))} keyboardType="phone-pad" />
      </SettingSection>

      <SettingSection title="Redes sociales">
        <SettingField label="Instagram" value={config.instagram} onChangeText={(value) => setConfig((current) => ({ ...current, instagram: value }))} placeholder="@pronatural" />
        <SettingField label="Facebook" value={config.facebook} onChangeText={(value) => setConfig((current) => ({ ...current, facebook: value }))} placeholder="fb.com/pronatural" />
        <SettingField label="TikTok" value={config.tiktok} onChangeText={(value) => setConfig((current) => ({ ...current, tiktok: value }))} placeholder="@pronatural" />
        <SettingField label="YouTube" value={config.youtube} onChangeText={(value) => setConfig((current) => ({ ...current, youtube: value }))} placeholder="youtube.com/@pronatural" />
      </SettingSection>

      <SettingSection title="Metas de ventas" description="Objetivos usados por el panel administrativo.">
        <SettingField label="Meta diaria ($)" value={config.metas.diaria} onChangeText={(value) => setConfig((current) => ({ ...current, metas: { ...current.metas, diaria: value } }))} keyboardType="decimal-pad" />
        <SettingField label="Meta semanal ($)" value={config.metas.semanal} onChangeText={(value) => setConfig((current) => ({ ...current, metas: { ...current.metas, semanal: value } }))} keyboardType="decimal-pad" />
        <SettingField label="Meta mensual ($)" value={config.metas.mensual} onChangeText={(value) => setConfig((current) => ({ ...current, metas: { ...current.metas, mensual: value } }))} keyboardType="decimal-pad" />
      </SettingSection>

      <SettingSection title="Impuestos y tarifas de envío" description="Valores compartidos con la tienda web.">
        <SettingField label="Tasa de impuesto (%)" value={config.taxRate} onChangeText={(value) => setConfig((current) => ({ ...current, taxRate: value }))} keyboardType="decimal-pad" />
        <SettingField label="Costo de envío / delivery ($ USD)" value={config.deliveryFee} onChangeText={(value) => setConfig((current) => ({ ...current, deliveryFee: value }))} keyboardType="decimal-pad" />
      </SettingSection>

      <TouchableOpacity style={styles.primaryButtonFull} onPress={handleSaveStore} disabled={savingStore}>
        {savingStore ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Guardar cambios de tienda</Text>}
      </TouchableOpacity>
    </>
  );

  const renderSecurityTab = () => (
    <>
      <SettingSection title="Cambiar contraseña" description="Usa una contraseña nueva de al menos 6 caracteres. Se notificará por correo.">
        <SettingField label="Contraseña actual" value={passwords.currentPassword} onChangeText={(value) => setPasswords((current) => ({ ...current, currentPassword: value }))} secureTextEntry />
        <SettingField label="Nueva contraseña" value={passwords.newPassword} onChangeText={(value) => setPasswords((current) => ({ ...current, newPassword: value }))} secureTextEntry />
        <SettingField label="Confirmar contraseña nueva" value={passwords.confirmPassword} onChangeText={(value) => setPasswords((current) => ({ ...current, confirmPassword: value }))} secureTextEntry />
        <TouchableOpacity style={styles.primaryButtonFull} onPress={handleChangePassword} disabled={savingPassword}>
          {savingPassword ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Actualizar contraseña</Text>}
        </TouchableOpacity>
      </SettingSection>

</>
  );

  const renderNotificationsTab = () => (
    <>
      <SettingSection title="Notificaciones generales" description="Estas preferencias se comparten con el panel web.">
        <ToggleRow title="Notificaciones en el portal" value={config.notificaciones.enabled} onPress={() => saveConfigChange({ ...config, notificaciones: { ...config.notificaciones, enabled: !config.notificaciones.enabled } })} />
        <ToggleRow title="Stock bajo" description="Avisar cuando un producto esté por agotarse." value={config.notificaciones.lowStock} disabled={!config.notificaciones.enabled} onPress={() => saveConfigChange({ ...config, notificaciones: { ...config.notificaciones, lowStock: !config.notificaciones.lowStock } })} />
        <ToggleRow title="Producto agotado" description="Avisar cuando un producto llegue a cero unidades." value={config.notificaciones.outOfStock} disabled={!config.notificaciones.enabled} onPress={() => saveConfigChange({ ...config, notificaciones: { ...config.notificaciones, outOfStock: !config.notificaciones.outOfStock } })} />
      </SettingSection>

      <SettingSection title="Reporte semanal de inventario" description="Programa el envío automático del PDF a los administradores.">
        <ToggleRow title="Habilitar envío automático" description="El servidor enviará el reporte según el horario elegido." value={config.reporteSemanal.enabled} disabled={savingReport} onPress={() => handleReportScheduleChange("enabled", !config.reporteSemanal.enabled)} />
        {config.reporteSemanal.enabled && (
          <>
            <Text style={styles.fieldLabel}>Día de la semana</Text>
            <View style={styles.daySelector}>
              {WEEK_DAYS.map((day, index) => (
                <TouchableOpacity key={day} style={[styles.dayButton, config.reporteSemanal.dia === index && styles.dayButtonActive]} onPress={() => handleReportScheduleChange("dia", index)} disabled={savingReport}>
                  <Text style={[styles.dayButtonText, config.reporteSemanal.dia === index && styles.dayButtonTextActive]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.timeFields}>
              <View style={{ flex: 1 }}><SettingField label="Hora (24 h)" value={config.reporteSemanal.hora} onChangeText={(value) => { if (/^\d{0,2}$/.test(value)) setConfig((current) => ({ ...current, reporteSemanal: { ...current.reporteSemanal, hora: value } })); }} keyboardType="number-pad" /></View>
              <View style={{ flex: 1 }}><SettingField label="Minuto" value={config.reporteSemanal.minuto} onChangeText={(value) => { if (/^\d{0,2}$/.test(value)) setConfig((current) => ({ ...current, reporteSemanal: { ...current.reporteSemanal, minuto: value } })); }} keyboardType="number-pad" /></View>
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveReportTime} disabled={savingReport}>
              <Text style={styles.secondaryButtonText}>{savingReport ? "Guardando horario…" : `Guardar horario · ${String(config.reporteSemanal.hora).padStart(2, "0")}:${String(config.reporteSemanal.minuto).padStart(2, "0")}`}</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={styles.reportAction}>
          <View style={styles.reportActionCopy}>
            <Text style={styles.reportActionTitle}>¿Necesitas el reporte ahora?</Text>
            <Text style={styles.reportActionDescription}>Genera y envía el PDF de inventario a los administradores.</Text>
          </View>
          <TouchableOpacity style={styles.reportButton} onPress={handleSendInventoryReport} disabled={sendingReport}>
            {sendingReport ? <ActivityIndicator color="#208B51" /> : <><Ionicons name="download-outline" size={17} color="#208B51" /><Text style={styles.reportButtonText}>Enviar</Text></>}
          </TouchableOpacity>
        </View>
      </SettingSection>
    </>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.heading}>
        <View style={styles.headingIcon}><Ionicons name="options-outline" size={22} color="#208B51" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Ajustes del sistema</Text>
          <Text style={styles.subtitle}>Tu cuenta y preferencias compartidas de ProNatural</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab.id }}>
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color="#0B2B1E" /><Text style={styles.loadingText}>Cargando ajustes…</Text></View>
      ) : (
        <View style={styles.sections}>
          {activeTab === "profile" && renderProfileTab()}
          {(activeTab === "store" || activeTab === "notifications") && !settingsAvailable && (
            <SettingSection title="Ajustes no disponibles" description="No se pudieron cargar los datos del servidor. Vuelve a abrir esta pantalla para intentarlo de nuevo." />
          )}
          {activeTab === "store" && settingsAvailable && renderStoreTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "notifications" && settingsAvailable && renderNotificationsTab()}
        </View>
      )}
    </ScrollView>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAF9F6" },
  content: { padding: 16, paddingBottom: 36 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  headingIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: "rgba(11, 43, 30, 0.13)", borderWidth: 1, borderColor: "rgba(11, 43, 30, 0.25)", alignItems: "center", justifyContent: "center" },
  title: { color: "#102B1E", fontSize: 21, fontWeight: "800" },
  subtitle: { color: "#68736A", fontSize: 12, marginTop: 3, lineHeight: 17 },
  tabsScroll: { flexGrow: 0, marginBottom: 16 },
  tabs: { gap: 8, paddingRight: 10 },
  tab: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.06)" },
  tabActive: { backgroundColor: "rgba(11, 43, 30, 0.16)", borderColor: "rgba(11, 43, 30, 0.38)" },
  tabText: { color: "#68736A", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#208B51", fontWeight: "800" },
  sections: { gap: 14 },
  section: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.07)", overflow: "hidden" },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: "rgba(16, 43, 30, 0.06)" },
  sectionTitle: { color: "#102B1E", fontSize: 16, fontWeight: "700" },
  sectionDescription: { color: "#68736A", fontSize: 12, lineHeight: 17, marginTop: 4 },
  sectionBody: { padding: 16 },
  field: { marginBottom: 14 },
  fieldLabel: { color: "#59675e", fontSize: 12, fontWeight: "650", marginBottom: 7 },
  input: { minHeight: 46, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.09)", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, color: "#102B1E", fontSize: 14 },
  multilineInput: { minHeight: 84 },
  disabledInput: { color: "#68736A", backgroundColor: "#F3F1EB" },
  profileSummary: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(16, 43, 30, 0.06)" },
  profileAvatar: { width: 54, height: 54, borderRadius: 19, backgroundColor: "rgba(11, 43, 30, 0.17)", borderWidth: 1, borderColor: "rgba(11, 43, 30, 0.35)", alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: "#208B51", fontSize: 22, fontWeight: "800" },
  profileIdentity: { flex: 1 },
  profileName: { color: "#102B1E", fontSize: 15, fontWeight: "700" },
  profileEmail: { color: "#68736A", fontSize: 12, marginTop: 3 },
  rolePill: { alignSelf: "flex-start", color: "#208B51", fontSize: 10, fontWeight: "700", backgroundColor: "rgba(11, 43, 30, 0.12)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  editIconButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(11, 43, 30, 0.1)", alignItems: "center", justifyContent: "center" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2, marginBottom: 12 },
  primaryButton: { minHeight: 46, paddingHorizontal: 16, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#0B2B1E", flex: 1 },
  primaryButtonFull: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#0B2B1E", marginTop: 4, marginBottom: 4 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", textAlign: "center" },
  secondaryButton: { flex: 1, minHeight: 44, paddingHorizontal: 11, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3ED", borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.12)" },
  secondaryButtonText: { color: "#263F33", fontSize: 12, fontWeight: "700", textAlign: "center" },
  toggleRow: { minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(16, 43, 30, 0.06)" },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: "#263F33", fontSize: 14, fontWeight: "600" },
  toggleDescription: { color: "#68736A", fontSize: 11, lineHeight: 16, marginTop: 3 },
  switchTrack: { width: 48, height: 28, borderRadius: 15, padding: 3, backgroundColor: "#D9DED8", justifyContent: "center" },
  switchTrackActive: { backgroundColor: "#238a4c" },
  switchThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF", transform: [{ translateX: 0 }] },
  switchThumbActive: { transform: [{ translateX: 20 }] },
  disabledSwitch: { opacity: 0.45 },
  daySelector: { flexDirection: "row", justifyContent: "space-between", gap: 5, marginTop: 5, marginBottom: 16 },
  dayButton: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(16, 43, 30, 0.07)" },
  dayButtonActive: { backgroundColor: "rgba(11, 43, 30, 0.17)", borderColor: "rgba(11, 43, 30, 0.4)" },
  dayButtonText: { color: "#68736A", fontSize: 10, fontWeight: "700" },
  dayButtonTextActive: { color: "#208B51" },
  timeFields: { flexDirection: "row", gap: 12 },
  reportAction: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(16, 43, 30, 0.07)" },
  reportActionCopy: { flex: 1 },
  reportActionTitle: { color: "#102B1E", fontSize: 13, fontWeight: "700" },
  reportActionDescription: { color: "#68736A", fontSize: 11, lineHeight: 15, marginTop: 3 },
  reportButton: { minHeight: 42, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(11, 43, 30, 0.3)", backgroundColor: "rgba(11, 43, 30, 0.1)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  reportButtonText: { color: "#208B51", fontSize: 12, fontWeight: "700" },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  loading: { paddingVertical: 52, alignItems: "center", gap: 12 },
  loadingText: { color: "#68736A", fontSize: 13 },
});

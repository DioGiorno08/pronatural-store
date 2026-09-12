// Página de ajustes del sistema
// Permite al administrador configurar datos de la tienda, seguridad y notificaciones
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useGlobalData } from "../../context/GlobalDataContext";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import { formatElSalvadorPhone, parseFullPhoneNumber } from "../../utils/phoneFormatter";
import PhoneInputField from "../../components/common/PhoneInputField";

// Componente reutilizable para cada sección de ajustes con título y descripción
function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-[#161b1e] border border-white/5 rounded-[14px] overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-[16px] text-white font-semibold">{title}</h3>
        {desc && <p className="text-[13px] text-gray-400 mt-1">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Campo de formulario con etiqueta, contenido y texto de ayuda opcional
function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-gray-300 text-[13px] font-medium mb-2 block">{label}</label>
      {children}
      {hint && <p className="text-gray-500 text-[11px] mt-1.5">{hint}</p>}
    </div>
  );
}

// Input de texto reutilizable con estilos del panel de admin
// Acepta valor controlado o no controlado y puede deshabilitarse
function Inp({ placeholder, defaultValue, value, type = "text", onChange, disabled }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value !== undefined ? value : (defaultValue || '')}
      onChange={onChange}
      disabled={disabled}
      className={`w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  );
}

// Interruptor on/off reutilizable para activar o desactivar funciones
// Puede ser controlado (prop checked+onChange) o no controlado (defaultChecked)
function Toggle({ label, desc, defaultChecked, checked: controlledChecked, onChange }) {
  // Estado interno para modo no controlado
  const [checked, setChecked] = useState(defaultChecked);
  // Priorizar el valor controlado si se proporciona desde el padre
  const isChecked = controlledChecked !== undefined ? controlledChecked : checked;

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="text-[14px] text-gray-200 font-medium">{label}</p>
        {desc && <p className="text-[12px] text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => {
          const newVal = !isChecked;
          setChecked(newVal);
          if (onChange) onChange(newVal);
        }}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${isChecked ? "bg-[#30b466]" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isChecked ? "left-[22px]" : "left-[2px]"}`}></span>
      </button>
    </div>
  );
}

// Definición de las pestañas del panel de ajustes
const TABS = [
  { id: "perfil", label: "Perfil y Cuenta" },
  { id: "tienda", label: "Informacion de Tienda" },
  { id: "seguridad", label: "Seguridad" },
  { id: "notificaciones", label: "Notificaciones" },
];

export default function Settings() {
  // Datos del usuario autenticado (admin) y método de actualización
  const { user, updateUserProfile } = useAuth();
  // Configuración global y funciones para actualizarla
  const { config, updateConfig, sendInventoryReport } = useGlobalData();
  // Pestaña activa en la navegación de ajustes
  const [activeTab, setActiveTab] = useState("perfil");

  // Estado para visualización y edición del perfil del usuario
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      await updateUserProfile(profileData);
      setIsEditingProfile(false);
      toast.success("Perfil y teléfono actualizados correctamente");
    } catch (err) {
      toast.error(err.message || "Error al actualizar perfil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const defaultConfig = {
    storeName: "Pro Natural", ruc: "", email: "info@pronatural.com", phone: "+503 2222-2222",
    address: "San Salvador, El Salvador", website: "https://pronatural.com", whatsapp: "50369674467", mapUrl: "",
    instagram: "@pronatural", facebook: "fb.com/pronatural", tiktok: "@pronatural", youtube: "youtube.com/@pronatural",
    taxRate: 0, deliveryFee: 3.50,
    metas: { diaria: 150, semanal: 1050, mensual: 4500 },
    notificaciones: { enabled: true, lowStock: true, outOfStock: true },
    reporteSemanal: { enabled: false, dia: 1, hora: 8, minuto: 0 }
  };

  const extractSrcUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/src=["']([^"']+)["']/i);
    return match && match[1] ? match[1] : url.trim();
  };

  const [localConfig, setLocalConfig] = useState({
    ...defaultConfig,
    ...(config || {}),
    mapUrl: extractSrcUrl(config?.mapUrl || ""),
    metas: { ...defaultConfig.metas, ...(config?.metas || {}) },
    notificaciones: { ...defaultConfig.notificaciones, ...(config?.notificaciones || {}) },
    reporteSemanal: { ...defaultConfig.reporteSemanal, ...(config?.reporteSemanal || {}) }
  });

  // Estado para el formulario de cambiar contraseña
  const [passState, setPassState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Sincronizar localConfig cuando el backend responda con la configuración de la DB
  useEffect(() => {
    if (config) {
      setLocalConfig({
        ...defaultConfig,
        ...config,
        mapUrl: extractSrcUrl(config.mapUrl || ""),
        metas: { ...defaultConfig.metas, ...(config.metas || {}) },
        notificaciones: { ...defaultConfig.notificaciones, ...(config.notificaciones || {}) },
        reporteSemanal: { ...defaultConfig.reporteSemanal, ...(config.reporteSemanal || {}) }
      });
    }
  }, [config]);

  const handleChange = (field, value, category = null) => {
    let finalValue = value;
    if (field === 'mapUrl' && typeof value === 'string') {
      finalValue = extractSrcUrl(value);
    }
    setLocalConfig(prev => {
      if (category) {
        return { ...prev, [category]: { ...prev[category], [field]: finalValue } };
      }
      return { ...prev, [field]: finalValue };
    });
  };

  const handleSave = async () => {
    try {
      const configToSave = {
        ...localConfig,
        mapUrl: extractSrcUrl(localConfig.mapUrl)
      };
      await updateConfig(configToSave);
      setLocalConfig(configToSave);
      toast.success("Ajustes guardados correctamente");
    } catch (e) {
      toast.error("Error al guardar ajustes: " + (e.message || ""));
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!passState.currentPassword) {
      return toast.error("Ingresa tu contraseña actual");
    }
    if (!passState.newPassword || passState.newPassword.length < 6) {
      return toast.error("La nueva contraseña debe tener al menos 6 caracteres");
    }
    if (passState.newPassword !== passState.confirmNewPassword) {
      return toast.error("Las contraseñas nuevas no coinciden");
    }

    try {
      setIsChangingPass(true);
      await api.changePassword({
        currentPassword: passState.currentPassword,
        newPassword: passState.newPassword
      });
      toast.success("Contraseña actualizada exitosamente. Se ha enviado una notificación a tu correo.");
      setPassState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error(err.message || "Error al actualizar contraseña");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSendReport = async () => {
    try {
      const loadingToast = toast.loading("Generando y enviando reporte PDF a los administradores...");
      await sendInventoryReport();
      toast.dismiss(loadingToast);
      toast.success(`¡Reporte de inventario enviado con éxito a ${user?.email || 'tu correo'}!`);
    } catch (e) {
      toast.dismiss();
      toast.error("Error al enviar el reporte: " + (e.message || ""));
    }
  };

  const handleReporteSemanalChange = async (field, value) => {
    const newReporteSemanal = {
      ...localConfig.reporteSemanal,
      [field]: value
    };
    const updatedLocal = {
      ...localConfig,
      reporteSemanal: newReporteSemanal
    };
    setLocalConfig(updatedLocal);
    try {
      await updateConfig(updatedLocal);
      const diasNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const diaTexto = diasNombre[newReporteSemanal.dia ?? 1] || "Lunes";
      const horaTexto = (newReporteSemanal.hora ?? 8).toString().padStart(2, '0');
      const minTexto = (newReporteSemanal.minuto ?? 0).toString().padStart(2, '0');

      if (field === 'enabled') {
        toast.success(value 
          ? `Envío automático activado: Cada ${diaTexto} a las ${horaTexto}:${minTexto} hrs` 
          : "Envío automático desactivado");
      } else {
        toast.success(`Programación actualizada: Todos los ${diaTexto} a las ${horaTexto}:${minTexto} hrs`);
      }
    } catch (e) {
      toast.error("Error al guardar programación: " + (e.message || ""));
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto pb-12 px-2 sm:px-4">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight">Ajustes del Sistema</h1>
          <p className="text-gray-400 text-[13px] sm:text-[14px] mt-1">Configura las preferencias globales y tu cuenta de administrador.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[14px] rounded-[10px] transition-colors cursor-pointer hidden sm:block">
          Guardar Cambios Globales
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="w-full lg:w-64 flex-shrink-0 bg-[#161b1e] border border-white/5 rounded-[12px] p-2 lg:sticky lg:top-4 flex flex-row lg:flex-col overflow-x-auto gap-1 scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex-shrink-0 lg:w-full text-left px-4 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1b4332]/40 text-[#4ade80]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full flex-1 space-y-6 min-w-0">
          {activeTab === "perfil" && (
            <SectionCard title="Tu Perfil" desc="Informacion personal y rol dentro del sistema.">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#1b4332] border-2 border-[#30b466]/40 flex items-center justify-center text-[24px] font-bold text-[#4ade80]">
                    {(user?.name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] font-semibold text-white">{user?.name || "Administrador"}</p>
                      <span className="px-2.5 py-0.5 bg-[#1b4332]/60 text-[#4ade80] text-[10px] font-bold rounded-full border border-[#30b466]/30">
                        {user?.role === 'Admin' ? 'Admin' : (user?.role === 'Employee' ? 'Vendedor' : 'Cliente')}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-400 mt-0.5">{user?.email || "admin@pronatural.com"}</p>
                  </div>
                </div>

                <div>
                  {isEditingProfile ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({ name: user?.name || '', phone: user?.phone || '' });
                        }}
                        className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isSavingProfile}
                        onClick={handleSaveProfile}
                        className="px-4 py-1.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Modificar Datos
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nombre Completo">
                  {isEditingProfile ? (
                    <Inp 
                      value={profileData.name} 
                      onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Tu nombre completo" 
                    />
                  ) : (
                    <Inp value={user?.name || ''} placeholder="Tu nombre completo" disabled />
                  )}
                </Field>

                <Field label="Correo Electronico" hint="Asociado permanentemente a tu cuenta de acceso">
                  <Inp type="email" value={user?.email || ''} placeholder="email@pronatural.com" disabled />
                </Field>

                <Field label="Telefono" hint="Solo visible para el equipo interno">
                  {isEditingProfile ? (
                    <PhoneInputField
                      value={profileData.phone}
                      onChange={(val) => setProfileData(p => ({ ...p, phone: val }))}
                      darkTheme={true}
                    />
                  ) : (
                    <Inp 
                      value={user?.phone ? formatElSalvadorPhone(user.phone) : '+503 (No registrado)'} 
                      placeholder="+503 7000-0000" 
                      disabled 
                    />
                  )}
                </Field>

                <Field label="Cargo / Rol">
                  <Inp 
                    value={user?.role === 'Admin' ? 'Administrador' : (user?.role === 'Employee' ? 'Empleado / Vendedor' : 'Cliente')} 
                    placeholder="Ej: Administrador" 
                    disabled 
                  />
                </Field>
              </div>
            </SectionCard>
          )}
          {activeTab === "tienda" && (
            <>
              <SectionCard title="Datos de la Empresa" desc="Informacion que aparece en facturas y recibos.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre de la Tienda"><Inp value={localConfig.storeName || ''} onChange={(e) => handleChange('storeName', e.target.value)} /></Field>
                  <Field label="RUC / NIT" hint="Numero de identificacion fiscal"><Inp value={localConfig.ruc || ''} onChange={(e) => handleChange('ruc', e.target.value)} placeholder="0614-XXXXXX-XXX-X" /></Field>
                  <Field label="Correo de Contacto"><Inp type="email" value={localConfig.email || ''} onChange={(e) => handleChange('email', e.target.value)} /></Field>
                  <Field label="Telefono de Contacto">
                    <PhoneInputField 
                      value={localConfig.phone || ''} 
                      onChange={(val) => handleChange('phone', val)} 
                      darkTheme={true}
                    />
                  </Field>
                  <div className="col-span-1 md:col-span-2"><Field label="Direccion Fisica"><Inp value={localConfig.address || ''} onChange={(e) => handleChange('address', e.target.value)} /></Field></div>
                  <div className="col-span-1 md:col-span-2"><Field label="Enlace del Mapa (Google Maps Embed URL)" hint="Enlace src del iframe de Google Maps para mostrar en la web"><Inp value={localConfig.mapUrl || ''} onChange={(e) => handleChange('mapUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." /></Field></div>
                  <Field label="Sitio Web"><Inp value={localConfig.website || ''} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://pronatural.com" /></Field>
                  <Field label="Whatsapp Business">
                    <PhoneInputField 
                      value={localConfig.whatsapp || ''} 
                      onChange={(val) => handleChange('whatsapp', val)} 
                      darkTheme={true}
                    />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Redes Sociales">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Instagram"><Inp value={localConfig.instagram || ''} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="@pronatural" /></Field>
                  <Field label="Facebook"><Inp value={localConfig.facebook || ''} onChange={(e) => handleChange('facebook', e.target.value)} placeholder="fb.com/pronatural" /></Field>
                  <Field label="TikTok"><Inp value={localConfig.tiktok || ''} onChange={(e) => handleChange('tiktok', e.target.value)} placeholder="@pronatural" /></Field>
                  <Field label="YouTube"><Inp value={localConfig.youtube || ''} onChange={(e) => handleChange('youtube', e.target.value)} placeholder="youtube.com/@pronatural" /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Metas de Ventas" desc="Establece objetivos monetarios para tu negocio.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Meta Diaria ($)"><Inp type="number" value={localConfig.metas?.diaria ?? 150} onChange={(e) => handleChange('diaria', Number(e.target.value), 'metas')} placeholder="Ej: 150" /></Field>
                  <Field label="Meta Semanal ($)"><Inp type="number" value={localConfig.metas?.semanal ?? 1050} onChange={(e) => handleChange('semanal', Number(e.target.value), 'metas')} placeholder="Ej: 1050" /></Field>
                  <Field label="Meta Mensual ($)"><Inp type="number" value={localConfig.metas?.mensual ?? 4500} onChange={(e) => handleChange('mensual', Number(e.target.value), 'metas')} placeholder="Ej: 4500" /></Field>
                </div>
              </SectionCard>

              <SectionCard 
                title="Impuestos y Tarifas de Envío (Delivery)" 
                desc="Configura el porcentaje de impuestos aplicable a las ventas y el costo de envío mostrado al cliente."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="Tasa de Impuesto (%)" 
                    hint="Porcentaje de impuesto aplicable a las compras en El Salvador (ej. 13% IVA o 0% si exento)"
                  >
                    <Inp 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="100" 
                      value={localConfig.taxRate ?? 0} 
                      onChange={(e) => handleChange('taxRate', Number(e.target.value))} 
                      placeholder="0" 
                    />
                  </Field>

                  <Field 
                    label="Costo de Envío / Delivery ($ USD)" 
                    hint="Tarifa fija de envío mostrada al cliente al completar su carrito y en la pantalla de pago"
                  >
                    <Inp 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={localConfig.deliveryFee ?? 3.50} 
                      onChange={(e) => handleChange('deliveryFee', Number(e.target.value))} 
                      placeholder="3.50" 
                    />
                  </Field>
                </div>
              </SectionCard>
            </>
          )}
          {activeTab === "seguridad" && (
            <>
              <SectionCard title="Cambiar Contraseña" desc="Usa una contraseña fuerte de al menos 6 caracteres. Se enviará un correo de notificación al guardar.">
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                  <Field label="Contraseña Actual">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passState.currentPassword}
                      onChange={(e) => setPassState(p => ({ ...p, currentPassword: e.target.value }))}
                      required
                      className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nueva Contraseña">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passState.newPassword}
                        onChange={(e) => setPassState(p => ({ ...p, newPassword: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors"
                      />
                    </Field>
                    <Field label="Confirmar Contraseña">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passState.confirmNewPassword}
                        onChange={(e) => setPassState(p => ({ ...p, confirmNewPassword: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors"
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="px-6 py-2.5 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 text-[#0a110d] font-bold text-[14px] rounded-[10px] transition-colors cursor-pointer"
                    >
                      {isChangingPass ? "Actualizando..." : "Actualizar Contraseña"}
                    </button>
                  </div>
                </form>
              </SectionCard>
            </>
          )}
          {activeTab === "notificaciones" && (
            <>
              <SectionCard title="Notificaciones Generales">
                <Toggle label="Notificaciones en el Portal" checked={localConfig.notificaciones?.enabled} onChange={(val) => handleChange('enabled', val, 'notificaciones')} />
                <Toggle label="Stock Bajo" desc="Alerta cuando algun producto este por agotarse." checked={localConfig.notificaciones?.lowStock} onChange={(val) => handleChange('lowStock', val, 'notificaciones')} />
                <Toggle label="Producto Agotado" desc="Alerta inmediata cuando un articulo llegue a cero." checked={localConfig.notificaciones?.outOfStock} onChange={(val) => handleChange('outOfStock', val, 'notificaciones')} />
              </SectionCard>
              <SectionCard title="Reporte de Inventario PDF" desc="Configura el envío automático del reporte a tu correo.">
                <Toggle 
                  label="Habilitar Envío Automático" 
                  desc="Se enviará de forma automática según la configuración a tu bandeja de entrada." 
                  checked={localConfig.reporteSemanal?.enabled} 
                  onChange={(val) => handleReporteSemanalChange('enabled', val)} 
                />
                
                {localConfig.reporteSemanal?.enabled && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                    {/* Banner de estado de programación activa */}
                    <div className="p-3.5 bg-[#1b4332]/30 border border-[#30b466]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#30b466] animate-pulse shrink-0"></span>
                        <span className="text-gray-200">
                          Programado para cada <strong>{["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][localConfig.reporteSemanal?.dia ?? 1]}</strong> a las <strong>{(localConfig.reporteSemanal?.hora ?? 8).toString().padStart(2, '0')}:{(localConfig.reporteSemanal?.minuto ?? 0).toString().padStart(2, '0')} hrs</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-[#4ade80] font-mono">
                        Destinatario: {user?.email || 'Administradores'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Día de la Semana">
                        <select 
                          value={localConfig.reporteSemanal?.dia ?? 1} 
                          onChange={(e) => handleReporteSemanalChange('dia', Number(e.target.value))} 
                          className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#4ade80]"
                        >
                          <option value={1}>Lunes</option>
                          <option value={2}>Martes</option>
                          <option value={3}>Miércoles</option>
                          <option value={4}>Jueves</option>
                          <option value={5}>Viernes</option>
                          <option value={6}>Sábado</option>
                          <option value={0}>Domingo</option>
                        </select>
                      </Field>
                      <Field label="Hora (Formato 24h)">
                        <select 
                          value={localConfig.reporteSemanal?.hora ?? 8} 
                          onChange={(e) => handleReporteSemanalChange('hora', Number(e.target.value))} 
                          className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#4ade80]"
                        >
                          {[...Array(24).keys()].map(h => (
                            <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Minuto exacto">
                        <select 
                          value={localConfig.reporteSemanal?.minuto ?? 0} 
                          onChange={(e) => handleReporteSemanalChange('minuto', Number(e.target.value))} 
                          className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#4ade80]"
                        >
                          {[...Array(60).keys()].map(m => (
                            <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-gray-300 font-medium">¿Necesitas un reporte ahora mismo?</p>
                    <p className="text-[11px] text-gray-500">Se generará el PDF y se enviará de inmediato a tu bandeja de entrada ({user?.email || 'Administradores'}).</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleSendReport} 
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#30b466]/15 hover:bg-[#30b466]/25 text-[#4ade80] border border-[#30b466]/30 font-medium text-[13px] rounded-[8px] transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Enviar Reporte Ahora
                  </button>
                </div>
              </SectionCard>
            </>
          )}
          
          <div className="pt-4 sm:hidden">
            <button onClick={handleSave} className="w-full py-3 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[15px] rounded-[10px] transition-colors cursor-pointer shadow-lg shadow-[#30b466]/20">
              Guardar Todos los Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
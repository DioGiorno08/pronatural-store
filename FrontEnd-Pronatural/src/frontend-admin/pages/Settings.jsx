import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useGlobalData } from "../../context/GlobalDataContext";
import toast from "react-hot-toast";
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
function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-gray-300 text-[13px] font-medium mb-2 block">{label}</label>
      {children}
      {hint && <p className="text-gray-500 text-[11px] mt-1.5">{hint}</p>}
    </div>
  );
}
function Inp({ placeholder, defaultValue, type = "text", onChange, disabled }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      className={`w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  );
}
function Toggle({ label, desc, defaultChecked, onChange }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="text-[14px] text-gray-200 font-medium">{label}</p>
        {desc && <p className="text-[12px] text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => {
          const newVal = !checked;
          setChecked(newVal);
          if (onChange) onChange(newVal);
        }}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${checked ? "bg-[#30b466]" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-[2px]"}`}></span>
      </button>
    </div>
  );
}
const TABS = [
  { id: "perfil", label: "Perfil y Cuenta" },
  { id: "tienda", label: "Informacion de Tienda" },
  { id: "seguridad", label: "Seguridad" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "pagos", label: "Metodos de Pago" },
];
export default function Settings() {
  const { user } = useAuth();
  const { config, updateConfig, sendInventoryReport } = useGlobalData();
  const [activeTab, setActiveTab] = useState("perfil");
  const defaultConfig = {
    storeName: "Pro Natural", ruc: "", email: "info@pronatural.com", phone: "+503 2222-2222",
    address: "San Salvador, El Salvador", website: "https://pronatural.com", whatsapp: "50369674467", mapUrl: "",
    instagram: "@pronatural", facebook: "fb.com/pronatural", tiktok: "@pronatural", youtube: "youtube.com/@pronatural",
    metas: { diaria: 150, semanal: 1050, mensual: 4500 },
    notificaciones: { enabled: true, lowStock: true, outOfStock: true },
    reporteSemanal: { enabled: false, dia: 1, hora: 8 }
  };

  const [localConfig, setLocalConfig] = useState({
    ...defaultConfig,
    ...(config || {}),
    metas: { ...defaultConfig.metas, ...(config?.metas || {}) },
    notificaciones: { ...defaultConfig.notificaciones, ...(config?.notificaciones || {}) },
    reporteSemanal: { ...defaultConfig.reporteSemanal, ...(config?.reporteSemanal || {}) }
  });

  const handleChange = (field, value, category = null) => {
    setLocalConfig(prev => {
      if (category) {
        return { ...prev, [category]: { ...prev[category], [field]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    try {
      await updateConfig(localConfig);
      toast.success("Ajustes guardados correctamente");
    } catch (e) {
      toast.error("Error al guardar ajustes");
    }
  };

  const handleSendReport = async () => {
    try {
      const loadingToast = toast.loading("Generando reporte...");
      await sendInventoryReport();
      toast.dismiss(loadingToast);
      toast.success("Reporte enviado al correo");
    } catch (e) {
      toast.dismiss();
      toast.error("Error al enviar el reporte");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Ajustes del Sistema</h1>
          <p className="text-gray-400 text-[14px] mt-1">Configura las preferencias globales y tu cuenta de administrador.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[14px] rounded-[10px] transition-colors cursor-pointer hidden md:block">
          Guardar Cambios Globales
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 flex-shrink-0 bg-[#161b1e] border border-white/5 rounded-[12px] p-2 md:sticky md:top-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1b4332]/40 text-[#4ade80]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-6">
          {activeTab === "perfil" && (
            <SectionCard title="Tu Perfil" desc="Informacion personal y rol dentro del sistema.">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-[#1b4332] border-2 border-[#30b466]/40 flex items-center justify-center text-[28px] font-bold text-[#4ade80]">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{user?.name || "Administrador"}</p>
                  <p className="text-[13px] text-gray-400">{user?.email || "admin@pronatural.com"}</p>
                  <span className="mt-1.5 inline-block px-2.5 py-0.5 bg-[#1b4332]/60 text-[#4ade80] text-[10px] font-bold rounded-full border border-[#30b466]/30">
                    {user?.role || "Administrador"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre Completo"><Inp defaultValue={user?.name} placeholder="Tu nombre completo" /></Field>
                <Field label="Correo Electronico"><Inp type="email" defaultValue={user?.email} placeholder="email@pronatural.com" disabled={user?.role !== 'Admin'} /></Field>
                <Field label="Telefono" hint="Solo visible para el equipo interno"><Inp defaultValue={user?.phone} placeholder="+503 xxxx-xxxx" disabled={user?.role !== 'Admin'} /></Field>
                <Field label="Cargo / Rol"><Inp defaultValue={user?.role === 'Admin' ? 'Administrador' : 'Vendedor'} placeholder="Ej: Gerente de Ventas" disabled={user?.role !== 'Admin'} /></Field>
              </div>
            </SectionCard>
          )}
          {activeTab === "tienda" && (
            <>
              <SectionCard title="Datos de la Empresa" desc="Informacion que aparece en facturas y recibos.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre de la Tienda"><Inp defaultValue={localConfig.storeName} onChange={(e) => handleChange('storeName', e.target.value)} /></Field>
                  <Field label="RUC / NIT" hint="Numero de identificacion fiscal"><Inp defaultValue={localConfig.ruc} onChange={(e) => handleChange('ruc', e.target.value)} placeholder="0614-XXXXXX-XXX-X" /></Field>
                  <Field label="Correo de Contacto"><Inp type="email" defaultValue={localConfig.email} onChange={(e) => handleChange('email', e.target.value)} /></Field>
                  <Field label="Telefono de Contacto"><Inp defaultValue={localConfig.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+503 xxxx-xxxx" /></Field>
                  <div className="col-span-2"><Field label="Direccion Fisica"><Inp defaultValue={localConfig.address} onChange={(e) => handleChange('address', e.target.value)} /></Field></div>
                  <div className="col-span-2"><Field label="Enlace del Mapa (Google Maps Embed URL)" hint="Enlace src del iframe de Google Maps para mostrar en la web"><Inp defaultValue={localConfig.mapUrl} onChange={(e) => handleChange('mapUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." /></Field></div>
                  <Field label="Sitio Web"><Inp defaultValue={localConfig.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://pronatural.com" /></Field>
                  <Field label="Whatsapp Business"><Inp defaultValue={localConfig.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="50369674467" /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Redes Sociales">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Instagram"><Inp defaultValue={localConfig.instagram} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="@pronatural" /></Field>
                  <Field label="Facebook"><Inp defaultValue={localConfig.facebook} onChange={(e) => handleChange('facebook', e.target.value)} placeholder="fb.com/pronatural" /></Field>
                  <Field label="TikTok"><Inp defaultValue={localConfig.tiktok} onChange={(e) => handleChange('tiktok', e.target.value)} placeholder="@pronatural" /></Field>
                  <Field label="YouTube"><Inp defaultValue={localConfig.youtube} onChange={(e) => handleChange('youtube', e.target.value)} placeholder="youtube.com/@pronatural" /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Metas de Ventas" desc="Establece objetivos monetarios para tu negocio.">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Meta Diaria ($)"><Inp type="number" defaultValue={localConfig.metas.diaria} onChange={(e) => handleChange('diaria', Number(e.target.value), 'metas')} placeholder="Ej: 150" /></Field>
                  <Field label="Meta Semanal ($)"><Inp type="number" defaultValue={localConfig.metas.semanal} onChange={(e) => handleChange('semanal', Number(e.target.value), 'metas')} placeholder="Ej: 1050" /></Field>
                  <Field label="Meta Mensual ($)"><Inp type="number" defaultValue={localConfig.metas.mensual} onChange={(e) => handleChange('mensual', Number(e.target.value), 'metas')} placeholder="Ej: 4500" /></Field>
                </div>
              </SectionCard>
            </>
          )}
          {activeTab === "seguridad" && (
            <>
              <SectionCard title="Cambiar Contrasena" desc="Usa una contrasena fuerte de al menos 8 caracteres.">
                <div className="space-y-4">
                  <Field label="Contrasena Actual"><input type="password" placeholder="••••••••" className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors" /></Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nueva Contrasena"><input type="password" placeholder="••••••••" className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors" /></Field>
                    <Field label="Confirmar Contrasena"><input type="password" placeholder="••••••••" className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors" /></Field>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => toast.success("Contrasena actualizada")} className="px-6 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[14px] rounded-[10px] transition-colors cursor-pointer">Actualizar Contrasena</button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}
          {activeTab === "notificaciones" && (
            <>
              <SectionCard title="Notificaciones Generales">
                <Toggle label="Notificaciones en el Portal" defaultChecked={localConfig.notificaciones.enabled} onChange={(val) => handleChange('enabled', val, 'notificaciones')} />
                <Toggle label="Stock Bajo" desc="Alerta cuando algun producto este por agotarse." defaultChecked={localConfig.notificaciones.lowStock} onChange={(val) => handleChange('lowStock', val, 'notificaciones')} />
                <Toggle label="Producto Agotado" desc="Alerta inmediata cuando un articulo llegue a cero." defaultChecked={localConfig.notificaciones.outOfStock} onChange={(val) => handleChange('outOfStock', val, 'notificaciones')} />
              </SectionCard>
              <SectionCard title="Reporte de Inventario PDF" desc="Configura el envío automático del reporte a tu correo.">
                <Toggle label="Habilitar Envío Automático" desc="Se enviará de forma automática según la configuración." defaultChecked={localConfig.reporteSemanal.enabled} onChange={(val) => handleChange('enabled', val, 'reporteSemanal')} />
                
                {localConfig.reporteSemanal.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <Field label="Día de la Semana">
                      <select defaultValue={localConfig.reporteSemanal.dia} onChange={(e) => handleChange('dia', Number(e.target.value), 'reporteSemanal')} className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#4ade80]">
                        <option value={1}>Lunes</option><option value={2}>Martes</option><option value={3}>Miércoles</option><option value={4}>Jueves</option><option value={5}>Viernes</option><option value={6}>Sábado</option><option value={0}>Domingo</option>
                      </select>
                    </Field>
                    <Field label="Hora (Formato 24h)">
                      <select defaultValue={localConfig.reporteSemanal.hora} onChange={(e) => handleChange('hora', Number(e.target.value), 'reporteSemanal')} className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#4ade80]">
                        {[...Array(24).keys()].map(h => <option key={h} value={h}>{h}:00</option>)}
                      </select>
                    </Field>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[13px] text-gray-400">¿Necesitas un reporte ahora mismo?</p>
                  <button onClick={handleSendReport} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-[13px] rounded-[8px] transition-colors cursor-pointer border border-white/10">
                    Enviar Reporte Ahora
                  </button>
                </div>
              </SectionCard>
            </>
          )}
          
          <div className="pt-4 md:hidden">
            <button onClick={handleSave} className="w-full py-3 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[15px] rounded-[10px] transition-colors cursor-pointer shadow-lg shadow-[#30b466]/20">
              Guardar Todos los Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
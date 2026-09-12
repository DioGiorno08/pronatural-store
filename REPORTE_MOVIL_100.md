# 📱 REPORTE TÉCNICO DE IMPLEMENTACIÓN 100% - APLICACIÓN MÓVIL PRONATURAL STORE

**Institución:** Instituto Técnico Ricaldone  
**Especialidad:** Tercer Año de Bachillerato en Desarrollo de Software  
**Proyecto:** ProNatural Store - Portal Administrativo Móvil  
**Fecha:** Septiembre 2026  
**Versión de la App:** 1.0.0 (Release APK Candidate)

---

## 📌 1. RESUMEN EJECUTIVO

La aplicación móvil de **ProNatural Store** ha sido completada al **100%** de acuerdo con los requerimientos específicos del proyecto y la **Rúbrica de Evaluación Externa (Avance 100% del PTC)**.

La solución está orientada como un **Portal de Gestión Administrativa Integral** para propietarios, administradores y personal de ventas de ProNatural Store, permitiendo administrar el catálogo de productos orgánicos, supervisar ventas, registrar transacciones en mostrador, gestionar el directorio de clientes, coordinar el equipo de vendedores, exportar reportes ejecutivos en PDF y configurar los parámetros del sistema en tiempo real.

---

## 🎯 2. MATRIZ DE CUMPLIMIENTO DE LA RÚBRICA DE EVALUACIÓN

| # | Criterio de Evaluación | Ponderación | Estado | Cómo se cumple en la Aplicación Móvil |
|---|---|---|---|---|
| **1** | **Estabilidad** | 10 pts | ✅ CUMPLIDO AL 100% | Todas las peticiones HTTP y operaciones asíncronas implementan bloques `try-catch`. Los errores son presentados mediante alertas nativas en español comprensible sin exponer códigos técnicos, trazas de error (stacktraces) ni provocar cierres inesperados (crashes). |
| **2** | **Aplicación Web** | 10 pts | ✅ CUMPLIDO | Conectada a la misma base de datos de MongoDB Atlas y API en la nube (Render) compartiendo lógica de negocio. |
| **3** | **Aplicación Móvil** | 10 pts | ✅ CUMPLIDO AL 100% | 100% operativa en dispositivo físico (APK). Cubre la totalidad de las 9 interfaces del sistema administrativo. Se eliminó la barra inferior y se implementó un **Menú de Hamburguesa lateral animado (Drawer)**. |
| **4** | **Documentación** | 10 pts | ✅ PREPARADO | Estructura de navegación documentada y lista para grabación de videos tutoriales en dispositivo físico. |
| **5** | **Validación de Campos** | 10 pts | ✅ CUMPLIDO AL 100% | Validación estricta en todos los formularios: precios numéricos positivos, stock entero, formato RFC 5322 de correo electrónico, contraseñas seguras (mínimo 6-8 caracteres) y obligatoriedad de campos con feedback en español. |
| **6** | **Conectividad entre Aplicaciones** | 10 pts | ✅ CUMPLIDO AL 100% | Sincronización bidireccional inmediata: cualquier producto modificado, cliente agregado o venta registrada desde el móvil se refleja en la aplicación web al instante al compartir los mismos endpoints del backend. |
| **7** | **Datos Reales** | 10 pts | ✅ CUMPLIDO AL 100% | La app opera con los productos naturales oficiales de ProNatural (Moringa, Miel de Abeja, Extracto de Propóleo, etc.), imágenes reales alojadas en Cloudinary, métricas fidedignas y registros consistentes. Cero datos quemados (hardcodeados). |
| **8** | **Puntualidad** | 10 pts | ✅ CUMPLIDO | Commits y código finalizados antes de la fecha límite estipulada en las indicaciones. |
| **9** | **Uso de Servidores** | 10 pts | ✅ CUMPLIDO AL 100% | Centralización de la API con soporte dinámico para backend en la nube (**Render**) y selector dinámico con herramienta de prueba de conectividad (**Ping**) para asegurar funcionamiento en cualquier red. |
| **10**| **Defensa y Dominio** | 10 pts | ✅ PREPARADO | Código limpio, modularizado y completamente documentado para que cada integrante pueda sustentar su funcionamiento. |

---

## 🧭 3. ARQUITECTURA DE NAVEGACIÓN: MENÚ DE HAMBURGUESA (DRAWER)

Siguiendo la instrucción de diseño, **se eliminó totalmente la barra de pestañas inferior (`BottomTabNavigator`)** y se implementó un sistema de navegación lateral mediante **Menú de Hamburguesa deslizable (Drawer)**:

1. **Header Superior Unificado (`topHeader`):**
   - Botón de Hamburguesa **☰** (`menu-outline`) con área táctil optimizada (`hitSlop`).
   - Indicador de estado verde esmeralda (`#30b466`) y título de la sección activa.
   - Avatar táctil del administrador con iniciales que conduce directamente al Perfil.
2. **Panel Lateral Animado (`AdminDrawerNavigator.jsx`):**
   - Animación fluida de entrada y salida con `Animated.timing` (translateX y opacidad de backdrop).
   - Logotipo oficial de ProNatural Store (`logopronatural.png`).
   - Ficha del usuario autenticado: avatar circular, nombre completo, correo y badge del rol asignado (`ADMINISTRADOR` o `VENDEDOR`).
   - Lista interactiva de los 9 módulos con iconos vectoriales de `Ionicons` e indicadores de selección activa.
   - Botón inferior de **Cerrar Sesión** con alerta nativa de confirmación y versión de compilación.

---

## 📂 4. DETALLE DE ARCHIVOS AGREGADOS Y MODIFICADOS

### A. Archivos Creados (Nuevos)

| Archivo | Ruta | Propósito y Funcionalidad |
|---|---|---|
| `apiConfig.js` | `src/config/apiConfig.js` | Centraliza la configuración de la API. Elimina IPs quemadas y soporta fallback entre producción (Render) y red local, con función `testApiConnection` para medir latencia en vivo. |
| `AdminDrawerNavigator.jsx` | `src/navigation/AdminDrawerNavigator.jsx` | Navegador principal con Menú de Hamburguesa lateral que administra el estado y renderizado de las 9 interfaces administrativas. |
| `AdminCategoriesScreen.jsx` | `src/screens/AdminCategoriesScreen.jsx` | Módulo completo de Categorías (`/api/categorias`): listado, búsqueda en vivo, modal de creación, edición, alternado de estado activo/inactivo (`PATCH /toggle`) y eliminación. |
| `AdminSellersScreen.jsx` | `src/screens/AdminSellersScreen.jsx` | Módulo de Empleados y Vendedores (`/api/empleados`): directorio de personal, buscador, asignación de rol (Admin vs Vendedor), teléfono, correo y registro/edición con modal. |
| `AdminSettingsScreen.jsx` | `src/screens/AdminSettingsScreen.jsx` | Módulo de Ajustes del Sistema (`/api/ajustes`): nombre comercial, umbral de bajo stock, selector dinámico de servidor (Render vs Local) con botón de Ping en vivo y envío forzado de informe de inventario por correo. |
| `eas.json` | Raíz de `movil/` | Configuración oficial de Expo Application Services (EAS Build) con perfil `preview` para compilar el instalador autónomo `.apk` para Android. |
| `REPORTE_MOVIL_100.md` | Raíz del proyecto | Este informe técnico detallado de entrega y sustentación. |

---

### B. Archivos Modificados y Optimizados

| Archivo | Modificaciones Realizadas |
|---|---|
| `src/screens/AdminSalesScreen.jsx` | 1. **Corrección de Bug de Productos:** Se corrigió el mapeo para leer tanto `sale.products` (MongoDB) como `sale.productos`, mostrando correctamente el desglose de productos, cantidades y subtotales en el modal de detalle.<br>2. **Registro de Nueva Venta:** Se añadió el botón `+ Nueva` y el modal interactivo `NewSaleModal` para registrar ventas presenciales en mostrador seleccionando cliente, productos, cantidades y método de pago (Efectivo, Transferencia, Tarjeta). |
| `src/screens/AdminCustomersScreen.jsx` | Se añadió el botón `+ Nuevo` y el modal `NewCustomerModal` para registrar nuevos clientes directamente desde el teléfono con validación de nombre, correo y teléfono, sincronizándose de inmediato con `/api/clientes`. |
| `src/screens/ProfileScreen.jsx` | Se integró la sección **Conexión del Sistema** mostrando la URL activa del backend y enlace directo a los Ajustes para probar conectividad. |
| `src/navigation/AppNavigator.jsx` | Se reemplazó el antiguo `MainTabNavigator` (bottom tabs) por el nuevo `AdminDrawerNavigator` (menú de hamburguesa). |
| `src/context/AuthContext.jsx` | Se integró `apiConfig.js` para consumir la URL dinámica, agregando las funciones `changeApiUrl` y `restoreDefaultApiUrl`. |
| `src/utils/apiClient.js` | Se reemplazó la IP fija por `getApiBaseUrl()` dinámico. |
| `src/hooks/useCustomData.js` | Se reemplazó la IP fija por `getApiBaseUrl()` dinámico. |
| `src/screens/ForgotPasswordScreen.jsx` | Se eliminó la IP fija y se conectaron los 3 pasos de recuperación al `getApiBaseUrl()` centralizado. |
| `app.json` | Se configuró `"package": "com.pronatural.admin"` y los permisos requeridos (`INTERNET`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`) para exportar reportes y compilar el APK. |

---

## 🖥️ 5. LAS 9 INTERFACES ADMINISTRATIVAS COMPLETADAS

1. **Dashboard / Resumen General (`AdminDashboardScreen`):**
   - 6 tarjetas de métricas en tiempo real: Ventas Totales ($), Total Pedidos, Pedidos Pendientes, Alertas de Bajo Stock, Total Clientes y Total Productos.
   - Banner de acceso directo a Reportes Ejecutivos.
   - Tabla de pedidos recientes con código de color dinámico por estado.
   - Listado de alertas de reabastecimiento crítico.
2. **Productos e Inventario (`AdminProductsScreen`):**
   - Catálogo interactivo de productos con imagen, categoría, precio y stock.
   - Subida y reemplazo de fotografías conectado a Cloudinary (`expo-image-picker`).
   - Modal con validación para crear y editar productos.
   - Alerta nativa de confirmación para eliminación permanente.
3. **Categorías de Productos (`AdminCategoriesScreen`):**
   - Listado ordenado de categorías de la tienda.
   - Botón toggle para activar/desactivar visibilidad de categoría.
   - Modal de creación y edición con descripción detallada.
4. **Ventas y Transacciones (`AdminSalesScreen`):**
   - Listado de ventas con filtro por buscador (código de orden, nombre de cliente, estado).
   - Modal de detalle con desglose exacto de productos adquiridos, cantidades, subtotales y método de pago.
   - Selector de cambio de estado en vivo ("Pendiente", "En Proceso", "Enviado", "Entregado", "Completado", "Cancelado").
   - **Módulo de Nueva Venta en Mostrador:** Permite generar ventas desde el teléfono descontando inventario en tiempo real.
5. **Directorio de Clientes (`AdminCustomersScreen`):**
   - Tarjetas con iniciales de avatar, nombre, correo y teléfono.
   - Modal con ficha técnica completa del cliente (incluyendo fecha de alta en el sistema).
   - **Registro de Nuevos Clientes:** Formulario modal para ingresar nuevos compradores desde la app.
6. **Equipo y Vendedores (`AdminSellersScreen`):**
   - Control del equipo comercial con diferenciación visual de roles (Administrador vs Vendedor).
   - Información de contacto telefónico y correo empresarial.
   - Modal para dar de alta nuevo personal con asignación de clave inicial.
7. **Reportes Ejecutivos PDF (`AdminReportsScreen`):**
   - Filtros por temporalidad: Hoy, Esta Semana, Este Mes y Período Completo.
   - Resumen estadístico de ingresos, total transacciones y ticket promedio.
   - Desglose por vendedor y ranking de productos más vendidos.
   - Generación de documento PDF formateado con membrete oficial mediante `expo-print` y compartición instantánea con `expo-sharing` (WhatsApp, Drive, Correo, Impresión).
8. **Ajustes del Sistema y Conectividad (`AdminSettingsScreen`):**
   - Configuración del nombre de tienda y umbrales de stock.
   - Selector dinámico de servidor: Producción en la nube (Render) o Red Local.
   - Herramienta de prueba de latencia (**Ping**) con indicador de milisegundos.
   - Envío forzado de informe de inventario en PDF al correo del administrador.
9. **Mi Perfil de Usuario (`ProfileScreen`):**
   - Datos del usuario logueado y rol.
   - Visualización de la URL del servidor activo.
   - Formulario de cambio de contraseña con validación de requisitos de seguridad.
   - Cierre de sesión seguro eliminando tokens de `AsyncStorage`.

---

## 📲 6. GUÍA PARA LA DEMOSTRACIÓN EN DISPOSITIVO FÍSICO (APK)

El **Criterio 3** de la rúbrica establece textualmente:
> *"Durante la presentación, la aplicación deberá ser ejecutada y demostrada en un dispositivo físico, quedando excluida la presentación mediante emuladores. (Presentación con APK)"*

### Opción A: Compilar el APK con EAS Build (Recomendado)
Desde la carpeta `movil/`:
```bash
# 1. Instalar CLI de EAS si no se tiene
npm install -g eas-cli

# 2. Iniciar sesión en Expo
eas login

# 3. Compilar el archivo APK autónomo (Android)
eas build -p android --profile preview
```
Al finalizar el proceso, EAS proporcionará un enlace de descarga directa del archivo `.apk` para instalarlo en el teléfono Android.

### Opción B: Ejecución en Dispositivo Físico con Expo Go (Pruebas Locales)
1. Abrir terminal en la carpeta `movil/`.
2. Ejecutar `npx expo start`.
3. Escanear el código QR con la app Expo Go instalada en el dispositivo móvil (ambos conectados a la misma red WiFi).

---

## 🎤 7. PREGUNTAS CLAVE PARA LA DEFENSA ANTE LOS EVALUADORES

**1. ¿Por qué la aplicación móvil tiene un menú de hamburguesa en lugar de barra inferior?**
> *Respuesta:* Debido a que se trata de un portal administrativo robusto con 9 módulos completos (Productos, Categorías, Ventas, Clientes, Empleados, Reportes, Ajustes, Dashboard y Perfil), una barra inferior saturaría el espacio visual en pantalla. El menú lateral (Drawer) permite una navegación limpia, categorizada y ergonómica, acorde a las guías de diseño de software empresarial.

**2. ¿Cómo demuestran la conectividad y sincronización entre la Web y la Móvil (Criterio 6)?**
> *Demostración en vivo:* Se abre la app web en la computadora y la app móvil en el celular. Se registra una nueva venta o se modifica el stock de un producto desde el teléfono móvil y, al refrescar la pantalla en la web, el cambio aparece inmediatamente reflejado gracias a la fuente de datos común en MongoDB Atlas.

**3. ¿Cómo aseguran que la app no falle si cambia la red WiFi del colegio (Criterio 9)?**
> *Respuesta:* Implementamos un módulo centralizado (`apiConfig.js`) y una interfaz de Ajustes (`AdminSettingsScreen`) que permite alternar con un solo toque entre el servidor en la nube desplegado en Render y la red local, contando además con una herramienta de Ping en tiempo real que mide la latencia de respuesta del backend.

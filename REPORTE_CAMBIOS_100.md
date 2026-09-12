# 📋 REPORTE DE CAMBIOS Y MEJORAS — PROYECTO PRONATURAL (RÚBRICA 100%)

Este documento contiene el registro ordenado, indexado y detallado de todas las modificaciones realizadas en el proyecto para asegurar la calificación máxima (100%) según los lineamientos de la Rúbrica Oficial de Software 2026.

> **💡 Control de Cambios y Trazabilidad:**
> Cada modificación cuenta con un identificador único (ejemplo: `[WEB-01]`, `[WEB-02]`) para facilitar el seguimiento, control de versiones y auditoría técnica de cada requerimiento durante la defensa.

---

## 🌐 PARTE 1: APLICACIÓN WEB

| ID | Módulo / Archivo | Tipo de Cambio | Criterio Rúbrica | Estado |
|---|---|---|---|---|
| **[WEB-01]** | `src/components/catalog/ProductSkeleton.jsx` | UX / Animación | Dinamismo & Experiencia de Usuario | ✅ Implementado |
| **[WEB-02]** | `src/context/GlobalDataContext.jsx` | Estado / Reactividad | Estabilidad & Prevención de Errores | ✅ Implementado |
| **[WEB-03]** | `src/components/catalog/ProductCard.jsx` | Estabilidad & UX | Prevención de Caídas & Microinteracciones | ✅ Implementado |
| **[WEB-04]** | `src/frontend-clientes/pages/Catalog.jsx` | UX & Dinamismo | Cero Pantallas Estáticas / Loaders | ✅ Implementado |
| **[WEB-05]** | `src/utils/api.js` | API / Errores | Manejo Global de Errores & Notificaciones | ✅ Implementado |
| **[WEB-06]** | `src/frontend-clientes/pages/Checkout.jsx` | Validaciones | Sin Campos Nulos & Mensajes en Español | ✅ Implementado |
| **[WEB-07]** | `src/components/common/ErrorBoundary.jsx` | Resiliencia | Cero Pantallas Blancas / Recuperación | ✅ Implementado |
| **[WEB-08]** | `src/components/common/ScrollToTop.jsx` + Layouts + CSS | UX / Navegación | Transiciones Suaves entre Páginas & Scroll | ✅ Implementado |
| **[WEB-09]** | `Contact.jsx` + `contactoController.js` + `sendMailMailjet.js` | Correo / Sesión | Envío desde Correo de Usuario Logueado a Administradores | ✅ Implementado |
| **[WEB-10]** | `Settings.jsx` + `authController.js` + `AdminRegister.jsx` | Perfil Admin / Sesión | Autocompletado y Sincronización Integral de Perfil (Nombre, Correo, Teléfono, Rol) | ✅ Implementado |
| **[WEB-11]** | `Settings.jsx` + `AjustesController.js` + `node-cron` | Automatización / PDF | Envío Automático Programado de Reportes de Inventario a Administradores | ✅ Implementado |

---

### Detalle Específico por Punto

#### `[WEB-01]` Creación de Skeleton Loaders para Productos
- **Archivo afectado:** [`FrontEnd-Pronatural/src/components/catalog/ProductSkeleton.jsx`](./FrontEnd-Pronatural/src/components/catalog/ProductSkeleton.jsx)
- **Criterio:** Experiencia de Usuario & Dinamismo (Evitar sitio estático).
- **Motivo:** Elimina la sensación de sitio congelado o pantalla vacía mientras se consultan los productos desde la base de datos MongoDB.
- **Detalle técnico:** Implementa un efecto *shimmer* y pulso con gradiente animado en Tailwind CSS que replica la silueta exacta de las tarjetas de producto (imagen con aspect-ratio 4:5, título, categoría, precio y botón).

#### `[WEB-02]` Inclusión de estado `isLoading` en `GlobalDataContext`
- **Archivo afectado:** [`FrontEnd-Pronatural/src/context/GlobalDataContext.jsx`](./FrontEnd-Pronatural/src/context/GlobalDataContext.jsx)
- **Criterio:** Estabilidad del Sistema & Reactividad.
- **Motivo:** Permite que las pantallas públicas y administrativas conozcan cuándo se están cargando los datos desde el backend, evitando el falso parpadeo de "No se encontraron productos".
- **Detalle técnico:** Se inicializó `isLoading` en `true`, se apaga en `finally` al terminar la petición paralela de `fetchAllData()`, y se exportó dentro del objeto expuesto por `GlobalDataContext.Provider`.

#### `[WEB-03]` Blindaje de Precios y Microinteracciones en Tarjetas de Producto
- **Archivo afectado:** [`FrontEnd-Pronatural/src/components/catalog/ProductCard.jsx`](./FrontEnd-Pronatural/src/components/catalog/ProductCard.jsx)
- **Criterio:** Prevención de Errores & Microinteracciones UI.
- **Motivo:** Evita el quiebre de la interfaz si un producto proviene con precio nulo/indefinido (`TypeError: price.toFixed is not a function`), y añade microinteracciones visuales fluidas.
- **Detalle técnico:**
  - Formateo seguro: `(Number(price) || 0).toFixed(2)`.
  - Efectos visuales: Elevación suave de la tarjeta (`hover:-translate-y-1 duration-300`), zoom en la imagen (`group-hover:scale-105 duration-500`) y botón con feedback de pulsación táctil (`active:scale-95 duration-200`).

#### `[WEB-04]` Integración de Skeletons y Estados de Carga en el Catálogo
- **Archivo afectado:** [`FrontEnd-Pronatural/src/frontend-clientes/pages/Catalog.jsx`](./FrontEnd-Pronatural/src/frontend-clientes/pages/Catalog.jsx)
- **Criterio:** Cero Sitios Estáticos / Fluidez de Carga.
- **Motivo:** El catálogo principal ahora muestra una cuadrícula animada de 8 skeletons mientras consulta la API, pasando fluidamente a los productos una vez recibidos.
- **Detalle técnico:** Consumo del estado `isLoading` de `useGlobalData()`; renderiza el componente `ProductSkeleton` antes de comprobar si el arreglo de productos está vacío.

#### `[WEB-05]` Manejo Centralizado de Errores HTTP y de Red en el Cliente API
- **Archivo afectado:** [`FrontEnd-Pronatural/src/utils/api.js`](./FrontEnd-Pronatural/src/utils/api.js)
- **Criterio:** Control de Excepciones y Estabilidad (100% Try-Catch & Manejo de Códigos).
- **Motivo:** Asegurar que cualquier fallo del servidor (400, 401, 403, 404, 429, 500) o caída del backend (`Failed to fetch`) sea interceptado con mensajes claros y descriptivos en español.
- **Detalle técnico:** Se estructuró `apiRequest` para inspeccionar `response.status`, extraer mensajes amigables del JSON del servidor, etiquetar errores con `err.status` y `err.isNetworkError`, y evitar errores no controlados.

#### `[WEB-06]` Blindaje de Validaciones en el Formulario de Checkout
- **Archivo afectado:** [`FrontEnd-Pronatural/src/frontend-clientes/pages/Checkout.jsx`](./FrontEnd-Pronatural/src/frontend-clientes/pages/Checkout.jsx)
- **Criterio:** Validaciones Estrictas en Español (Sin permitir valores nulos/vacíos).
- **Motivo:** Reemplazo de los textos genéricos (`'Requerido'`) por validaciones exhaustivas con expresiones regulares y longitudes mínimas.
- **Detalle técnico:**
  - **Correo:** Expresión regular RFC 5322 con mensaje descriptivo.
  - **Nombre:** Mínimo 3 caracteres.
  - **Dirección:** Mínimo 5 caracteres para asegurar ubicación detallada.
  - **Ciudad/Departamento:** Mínimo 3 caracteres.
  - **Código Postal:** Regla de 4 a 6 dígitos numéricos.

#### `[WEB-07]` Recuperación Elegante en Error Boundary
- **Archivo afectado:** [`FrontEnd-Pronatural/src/components/common/ErrorBoundary.jsx`](./FrontEnd-Pronatural/src/components/common/ErrorBoundary.jsx)
- **Criterio:** Tolerancia a Fallos y Prevención de Pantallas Blancas.
- **Motivo:** Si ocurre un error no previsto en cualquier componente, el usuario cuenta con dos alternativas claras en lugar de quedarse bloqueado en una pantalla rota.
- **Detalle técnico:** Se incorporó el botón "Volver al Inicio" (`window.location.href = '/'`) junto al botón "Recargar la Página", con estilos modernos acordes a la paleta del sistema.

#### `[WEB-08]` Transiciones Cinemáticas de Dos Fases con Framer Motion y Barra de Progreso
- **Archivos afectados:** 
  - [`FrontEnd-Pronatural/src/components/common/PageTransition.jsx`](./FrontEnd-Pronatural/src/components/common/PageTransition.jsx)
  - [`FrontEnd-Pronatural/src/components/common/RouteProgressBar.jsx`](./FrontEnd-Pronatural/src/components/common/RouteProgressBar.jsx)
  - [`FrontEnd-Pronatural/src/components/common/ScrollToTop.jsx`](./FrontEnd-Pronatural/src/components/common/ScrollToTop.jsx)
  - [`FrontEnd-Pronatural/src/components/layout/PublicLayout.jsx`](./FrontEnd-Pronatural/src/components/layout/PublicLayout.jsx)
  - [`FrontEnd-Pronatural/src/frontend-admin/pages/AdminLayout.jsx`](./FrontEnd-Pronatural/src/frontend-admin/pages/AdminLayout.jsx)
  - [`FrontEnd-Pronatural/src/App.jsx`](./FrontEnd-Pronatural/src/App.jsx)
- **Criterio:** Dinamismo visual & Experiencia de Usuario fluida.
- **Motivo:** Garantizar que las transiciones sean 100% visibles, fluidas y ejecutadas directamente por el motor de animación de Framer Motion sin depender de reinicios manuales de reflow CSS.
- **Detalle técnico:** 
  - **Integración de `framer-motion`:** Se utilizó `<AnimatePresence mode="wait">` para orquestar la salida obligatoria de la página anterior antes de montar la nueva:
    1. **Salida (Exit):** Desvanecimiento hacia arriba `y: -25`, `opacity: 0`, `filter: blur(6px)` en 250ms.
    2. **Entrada (Enter):** Deslizamiento vertical de **`45px`** (`y: 45` $\rightarrow$ `0`), con desenfoque suave **`filter: blur(8px)`** que se enfoca a `blur(0px)` y `opacity: 0` $\rightarrow$ `1` en 450ms con curva Bézier cúbica suave `[0.16, 1, 0.3, 1]`.
  - **Barra de Carga Superior (`RouteProgressBar`):** Línea luminosa verde esmeralda con sombra brillante en la parte superior fija que se desliza velozmente al navegar (estilo YouTube / GitHub / Next.js).
  - **Reinicio de Scroll (`ScrollToTop`):** Restablece automáticamente la posición de lectura al inicio en cada cambio de ruta.

#### `[WEB-09]` Vinculación de Formulario de Contacto al Usuario Logueado y Envío a Administradores
- **Archivos afectados:**
  - [`FrontEnd-Pronatural/src/frontend-clientes/pages/Contact.jsx`](./FrontEnd-Pronatural/src/frontend-clientes/pages/Contact.jsx)
  - [`Backend/src/controllers/contactoController.js`](./Backend/src/controllers/contactoController.js)
  - [`Backend/src/utils/sendMailMailjet.js`](./Backend/src/utils/sendMailMailjet.js)
- **Criterio:** Funcionalidad de Negocio & Seguridad en Autenticación.
- **Motivo:** Cumplir el requerimiento de que al enviar un mensaje de contacto, este se despache con la identidad y correo del usuario que tiene su sesión activa en el sistema, dirigiéndose automáticamente a las cuentas de correo de todos los administradores registrados.
- **Detalle técnico:**
  1. **Frontend (`Contact.jsx`):**
     - Integración con el contexto de sesión `useAuth()`.
     - Si el usuario está autenticado, su nombre (`user.name`) y correo (`user.email`) se inyectan automáticamente en el formulario.
     - Se muestra una insignia y aviso visual verde esmeralda *"Sesión iniciada como [Nombre] ([Correo]) - Verificado"*, protegiendo el campo de correo en modo lectura para evitar suplantación de identidad.
     - Si el usuario no ha iniciado sesión, se le brinda un enlace directo a `/login` o la posibilidad de escribir su correo manualmente.
  2. **Backend (`contactoController.js` & `sendMailMailjet.js`):**
     - El controlador de contacto consulta dinámicamente a todos los administradores en la colección `Usuarios` (`adminModel.find({}, "correo email")`), más el correo configurado en `AjustesSistema` y el fallback del `.env` (`USER_EMAIL`).
     - Se envía el correo a cada administrador con una plantilla HTML formal en modo oscuro con acentos verdes institucionales.
     - Se incorpora la cabecera `replyTo: email`, de manera que cuando cualquier administrador presione "Responder" en su cliente de correo (Gmail, Outlook, etc.), la respuesta irá directamente a la bandeja del usuario que estaba logueado.

#### `[WEB-10]` Autocompletado y Sincronización Integral del Perfil de Administrador (Nombre, Correo, Teléfono, Rol)
- **Archivos afectados:**
  - [`FrontEnd-Pronatural/src/frontend-admin/pages/Settings.jsx`](./FrontEnd-Pronatural/src/frontend-admin/pages/Settings.jsx)
  - [`FrontEnd-Pronatural/src/frontend-admin/pages/auth/AdminRegister.jsx`](./FrontEnd-Pronatural/src/frontend-admin/pages/auth/AdminRegister.jsx)
  - [`FrontEnd-Pronatural/src/context/AuthContext.jsx`](./FrontEnd-Pronatural/src/context/AuthContext.jsx)
  - [`FrontEnd-Pronatural/src/utils/api.js`](./FrontEnd-Pronatural/src/utils/api.js)
  - [`Backend/src/controllers/authController.js`](./Backend/src/controllers/authController.js)
  - [`Backend/src/routes/auth.js`](./Backend/src/routes/auth.js)
- **Criterio:** Seguridad, Consistencia de Datos & Experiencia de Usuario en Portal Administrativo.
- **Motivo:** En la sección "Tu Perfil", todos los campos deben poblarse automáticamente con la información real con la que se registró el administrador (Nombre completo, Correo, Teléfono en formato salvadoreño y Rol). Anteriormente, el teléfono no se enviaba al registrar y no se incluía en la sesión.
- **Detalle técnico:**
  1. **Registro:** `AdminRegister.jsx` ahora envía `phone: data.phone` en el payload de `api.register()`.
  2. **Backend:** `authController.register` y `authController.verifyCode` guardan `telefono` en el modelo `Admin`. En el inicio de sesión (`login`), se incluye `phone` dentro del token JWT y de la respuesta de usuario.
  3. **Endpoints de Perfil:** Se crearon `GET /api/auth/profile` y `PUT /api/auth/profile` para consultar datos actualizados de MongoDB y permitir al administrador modificar su nombre o teléfono.
  4. **Frontend (`Settings.jsx` y `AuthContext.jsx`):** La pestaña "Tu Perfil" sincroniza en vivo con la base de datos, muestra `+503 7593-7255` formateado y añade el botón "Modificar Datos" para actualizar información de contacto al instante.

#### `[WEB-11]` Automatización y Despacho Fiable de Reportes PDF Semanales a Administradores
- **Archivos afectados:**
  - [`FrontEnd-Pronatural/src/frontend-admin/pages/Settings.jsx`](./FrontEnd-Pronatural/src/frontend-admin/pages/Settings.jsx)
  - [`Backend/src/controllers/AjustesController.js`](./Backend/src/controllers/AjustesController.js)
  - [`Backend/database.js`](./Backend/database.js)
- **Criterio:** Automatización de Tareas en Segundo Plano (Cron Jobs) & Seguridad Operativa.
- **Motivo:** El reporte de inventario PDF semanal configurado por el usuario (día, hora y minuto) debe despacharse automáticamente de manera certera a las cuentas de los administradores y no a correos ficticios.
- **Detalle técnico:**
  1. **Destinatarios Reales:** `sendInventoryReport` en `AjustesController.js` ahora extrae dinámicamente todos los correos de administradores en la colección `Admin` de MongoDB, además del correo en `.env` y el correo de la sesión, enviando el PDF adjunto a cada uno.
  2. **Mecanismo Dual de Ejecución:**
     - **`node-cron` Programado:** Configura la expresión cron exacta (`minuto hora * * dia`) en la zona horaria `America/El_Salvador`.
     - **Heartbeat de Respaldo:** Chequeo cada 30 segundos que valida la hora local del sistema para garantizar el disparo puntual aún ante eventuales desviaciones de zona horaria o reinicios.
  3. **Feedback UI en Ajustes:** Se incorporó un banner verde esmeralda que indica el estado activo de la programación, el día, la hora exacta y los correos de destino, con confirmaciones toast inmediatas al guardar cambios.

---
*(Este reporte se mantendrá actualizado continuamente conforme avancemos con cada módulo).*

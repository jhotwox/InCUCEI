# Contexto General del Proyecto InCUCEI

## Descripción General
InCUCEI es una plataforma integral para la comunidad del Centro Universitario de Ciencias Exactas e Ingenierías (CUCEI) de la Universidad de Guadalajara. El sistema incluye un backend robusto en Node.js/Express y un cliente móvil desarrollado con React Native (Expo), orientado a proveer servicios académicos, mensajería, recursos escolares y un asistente inteligente basado en Gemini AI.

---

## Tecnologías Utilizadas

### Backend (server/)
- **Node.js** y **Express.js**: Framework principal para la API REST y servidor de sockets.
- **MongoDB** (Mongoose): Base de datos NoSQL para usuarios, comercios, mensajes y conversaciones de chatbot.
- **Socket.IO**: Comunicación en tiempo real para mensajería y notificaciones.
- **Zod**: Validación de esquemas de datos en endpoints.
- **Gemini AI (Google Generative AI)**: Asistente escolar inteligente, integrado vía API y con contexto conversacional.
- **Multer**: Manejo de archivos para subir imágenes (logo/banner de comercios, archivos académicos).
- **dotenv**: Manejo de variables de entorno.

### Frontend (client/)
- **React Native (Expo)**: Aplicación móvil multiplataforma.
- **React Navigation / Expo Router**: Navegación entre pantallas y rutas anidadas.
- **Socket.IO Client**: Comunicación en tiempo real con el backend.
- **React Native Paper**: Componentes UI y theming.
- **AsyncStorage**: Persistencia local de tokens y preferencias.
- **Context API**: Manejo de estado global (auth, socket, snackbar, chatbot).
- **Axios**: Cliente HTTP para consumir la API REST.
- **FormData**: Subida de archivos desde el cliente.

---

## Módulos y Funcionalidades

### 1. Autenticación y Usuarios
- Registro y login con correo institucional (@udg.mx).
- Validación de datos con Zod.
- JWT para autenticación y autorización.

### 2. Comercios
- Cada usuario puede registrar un único comercio.
- Subida de logo y banner (archivos únicos por usuario).
- Consulta y edición de información del comercio.

### 3. Mensajería
- Mensajes en tiempo real usuario <-> comercio (no usuario a usuario directo).
- Chats persistentes en MongoDB.
- Notificaciones y actualización instantánea vía Socket.IO.

### 3.1. Notificaciones push (Expo + FCM/APNs)
- Push remoto (Android/iOS) para nuevos mensajes **solo cuando el destinatario está en background u offline**.
- Cliente registra su `ExpoPushToken[...]` en el backend tras iniciar sesión.
- Backend decide si envía push usando presencia (Socket.IO + `AppState`).

**Cliente (client/)**
- Registro de token: [client/hooks/usePushNotifications.jsx](client/hooks/usePushNotifications.jsx)
	- Usa `expo-notifications`.
	- Guarda token por usuario en AsyncStorage: `expoPushToken:<userId>` (evita que una cuenta bloquee a otra en el mismo dispositivo).
	- Protección para dev-client sin rebuild: si falta el módulo nativo, hace no-op.
- Envío de estado de app: [client/contexts/Socket.context.jsx](client/contexts/Socket.context.jsx)
	- Emite `appState: { state: 'active' | 'background' }` al socket.
- Endpoint de registro: [client/api/auth.api.js](client/api/auth.api.js) → `POST /push-token`.

**Backend (server/)**
- Almacenamiento de tokens: `User.expoPushTokens[]` en [server/src/models/user.model.js](server/src/models/user.model.js).
- Endpoint: `POST /api/push-token` (auth) en [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js) / [server/src/controller/auth.controller.js](server/src/controller/auth.controller.js).
- Presencia en memoria: [server/src/app.js](server/src/app.js)
	- `app.set('presence', new Map())` con `{ sockets, state, updatedAt }` por usuario.
- Envío de push al crear mensajes (REST): [server/src/controller/message.controller.js](server/src/controller/message.controller.js)
	- Se integra a `sendMessage` y `sendCommerceMessage`.
	- Solo envía push si el destinatario está offline o `background`.
- Envío por Expo: [server/src/services/push/expoPush.service.js](server/src/services/push/expoPush.service.js) usando `expo-server-sdk`.

**Configuración requerida (Android)**
- FCM V1 en Expo/EAS: en `eas credentials -p android` configurar **Google Service Account Key for FCM V1**.
- `google-services.json` en proyecto Android y Gradle Google Services habilitado (para builds nativos/dev-client).
- Nota: si existe directorio `client/android/`, Expo/EAS usa la config nativa; algunos valores de `app.json/app.config.js` se ignoran.

**Variables y flags útiles**
- `PUSH_DEBUG_RECEIPTS=true` (server): habilita diagnóstico de receipts (si se implementa/usa).
- `EXPO_PUBLIC_DEBUG_FOREGROUND_NOTIFICATIONS=true` (client, DEV): opcional para mostrar alertas en foreground durante pruebas.

### 4. Chatbot Escolar (Gemini)
- Asistente escolar basado en Gemini Pro.
- Conversación contextual: historial de mensajes guardado y usado como contexto.
- Respuestas en tiempo real vía Socket.IO.
- Historial de conversación consultable y eliminable por el usuario.

#### 4.1. Objetivos del chatbot
- Otorgar información al usuario sobre horarios y metodos de contacto de dependencias escolares como control escolar, servicio social, biblioteca, enfermería, coordinación, etc.
- Ayudar al usuario a encontrar recursos académicos y planes de estudio.
- Responder preguntas frecuentes sobre trámites escolares y servicios de CUCEI.
- Proveer asistencia básica en navegación y uso de la plataforma InCUCEI.
- Mostrar en el mapa integrado las ubicaciones de las dependencias escolares dentro de CUCEI.

#### 4.2. Recursos Académicos
- Descarga de planes de estudio y archivos académicos.
- Consulta de materias y recursos asociados.

### 5. UI/UX
- Navegación por tabs y stacks.
- Tematización con React Native Paper.
- Componentes reutilizables y personalizados.
- Manejo de errores y feedback visual (snackbar, loaders, etc).

#### 5.1 Animaciones y Transiciones (pendiente)

### 6. Mapa 2.5D de CUCEI (pendiente)
- Integración de mapa interactivo para localizar dependencias escolares.
- Integracion con el chatbot para mostrar ubicaciones.
- Integración con mensajeria de comercios dentro del mapa (pendiente).
---

## Estructura de Carpetas

### Backend (server/src/)
- **models/**: Esquemas de Mongoose (User, Commerce, Message, ChatbotMessage)
- **controller/**: Lógica de negocio para cada recurso
- **routes/**: Definición de rutas Express
- **middlewares/**: Validaciones, autenticación, manejo de archivos
- **services/**: Integraciones externas (Gemini)
- **uploads/**: Archivos subidos por usuarios

### Frontend (client/)
- **app/**: Pantallas y layouts principales
- **components/**: Componentes UI reutilizables
- **contexts/**: Contextos globales (auth, socket, snackbar)
- **hooks/**: Hooks personalizados (useChatBot, useMessages, etc)
- **api/**: Lógica de consumo de la API REST
- **assets/**: Imágenes y recursos estáticos
- **styles/**: Estilos globales

---

## Flujo de Comunicación
- **HTTP REST**: Para operaciones CRUD, autenticación, recursos, historial de chatbot.
- **Socket.IO**: Para mensajería en tiempo real y respuestas del chatbot.
- **Gemini AI**: El backend actúa como proxy seguro entre el cliente y la API de Gemini, agregando contexto y persistiendo el historial.

---

## Seguridad
- Tokens JWT almacenados en AsyncStorage (no cookies).
- Validación de roles y permisos en el backend.
- Validación de archivos y tipos MIME en uploads.
- Claves de API y secretos solo en el backend.

**Nota crítica (push credentials)**
- No versionar llaves privadas de Google/Firebase (service accounts tipo `firebase-adminsdk-*.json`).
- Para FCM V1 se sube el JSON a EAS Credentials; el archivo debe mantenerse local y fuera del repo.

---

## Notas para Agentes y Colaboradores
- **No exponer claves ni lógica sensible en el frontend.**
- **Toda la lógica de IA y acceso a recursos internos debe pasar por el backend.**
- **El historial de chatbot es fundamental para la experiencia conversacional y debe mantenerse sincronizado.**
- **La estructura de carpetas y los nombres de archivos siguen convenciones estándar para facilitar la colaboración.**

---

##  Ubicaciones Clave
### Frontend (client/)
- [client/layout/providers.layout.jsx](client/layout/providers.layout.jsx): Provider tree, tema (React Native Paper) y `GestureHandlerRootView`.
- [client/components/Toast.jsx](client/components/Toast.jsx): Toast custom (Portal + gestures).

---

## Lista de contextos
- [client/contexts/Toast.context.jsx](client/contexts/Toast.context.jsx): Manejo global del toast (`showToast`).
- [client/contexts/Auth.context.jsx](client/contexts/Auth.context.jsx): Manejo de autenticación y estado del usuario.
- [client/contexts/Socket.context.jsx](client/contexts/Socket.context.jsx): Conexión y manejo de Socket.IO (presencia + mensajería).
- [client/contexts/BackgroundAnimation.context.jsx](client/contexts/BackgroundAnimation.context.jsx): Estado global de animación del fondo.

---

## Contacto y Recursos
- Documentación técnica: consultar los archivos README.md y los esquemas en `/server/src/schemas/`.
- Para dudas sobre integración de Gemini, revisar `/server/src/services/gemini.service.js`.
- Para nuevas funcionalidades, seguir la arquitectura modular y aprovechar los contextos y hooks existentes.

---

**Última actualización:** 5 de mayo de 2026

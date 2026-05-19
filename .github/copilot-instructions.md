# Copilot Instructions for InCUCEI Workspace

## Overview
This workspace contains a multi-component academic assistant system for CUCEI, including:

InCUCEI is a platform for the CUCEI community (Universidad de Guadalajara), providing academic services, messaging, resources, and a dual-engine intelligent assistant (Gemini AI & Rasa Pro). The backend is Node.js/Express, the client is React Native (Expo), and the system is designed for modularity, security, and horizontal scalability.

## Key Architectural Patterns

### Technologies
- **Backend**: Node.js/Express, MongoDB (Mongoose), Socket.IO, Redis (Adapter for multi-instance), Zod, Gemini AI (Google Generative AI), Rasa Pro (CALM/Flows), Multer, dotenv, Expo Push (`expo-server-sdk`)
- **Frontend**: React Native (Expo), React Navigation/Expo Router, Socket.IO Client, React Native Paper, AsyncStorage, Context API, Axios, FormData, Reanimated 4, Expo Blur, `react-native-gesture-handler` (GestureHandlerRootView, GestureDetector, Gesture), Push (`expo-notifications`)

## Performance Best Practices
- **Memoization**: Use `React.memo()` for components, `useCallback()` for functions, and `useMemo()` for expensive computations
- **FlatList Optimization**: Configure `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, and `initialNumToRender` for large lists
- **Context Usage**: Keep contexts focused and avoid unnecessary re-renders. Use refs to prevent re-fetching data
- **Background Component**: Memoized animated background using global context to maintain animation state across screens
- **Socket.IO Scaling**: Uses Redis adapter to share rooms and events between multiple backend instances

## Developer Workflows
### Chatbot (Rasa)
  ```bash
  # Local virtual environment
  pyenv local 3.11.9
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  
  # Commands
  rasa train                                   # Train the model
  rasa run --enable-api --cors "*" --port 5005 # Run Core Server
  rasa run actions --port 5055                # Run Action Server
  ```

### Docker (Rasa Local Test)
  ```bash
  docker compose -f docker-compose.rasa.yml up --build
  ```

### Build & Debug
- **Backend**: Modular controllers, routes, and services. Use Zod for validation, Socket.IO for real-time features, and Multer for file uploads.
- **Frontend**: Use Contexts for global state (`contexts/Auth.context.jsx`, `contexts/Toast.context.jsx`, `contexts/Socket.context.jsx`, `contexts/BackgroundAnimation.context.jsx`, `contexts/ChatbotType.context.jsx`, etc.). API logic in `client/api/`. UI theming in `layout/providers.layout.jsx`.
- **Gesture support**: `GestureHandlerRootView` wraps the entire provider tree in `layout/providers.layout.jsx`. Any component using `GestureDetector` (e.g., `Toast.jsx`) must be a descendant of it.
- **Chatbot**: Gemini AI integration via backend proxy.
- **Theme**: Material Design 3 with custom color palette optimized for accessibility (WCAG AA compliance). Custom colors include `update`, `delete` for action buttons.

#### Push Notifications (Expo + FCM/APNs)
- **Goal**: Send a push notification when a new message arrives **only if the recipient is background/offline** (avoid duplicates while user is actively chatting).
- **Client registration**:
  - Token hook: `client/hooks/usePushNotifications.jsx`
    - Stores token per user in AsyncStorage (`expoPushToken:<userId>`) so multiple accounts on one device work correctly.
    - Uses `requireOptionalNativeModule('ExpoPushTokenManager')` to avoid crashing when the dev-client hasn't been rebuilt after installing `expo-notifications`.
  - Socket presence updates via `AppState`: `client/contexts/Socket.context.jsx` emits `appState`.
  - API call: `client/api/auth.api.js` → `registerPushTokenRequest()`
- **Server registration**:
  - Endpoint: `POST /api/push-token` (auth required) in `server/src/routes/auth.routes.js`
  - Controller: `server/src/controller/auth.controller.js` validates token with `Expo.isExpoPushToken()`
  - User schema: `expoPushTokens: [String]` in `server/src/models/user.model.js`
- **Presence gating**:
  - In-memory store in `server/src/app.js` under `app.set('presence', new Map())` keyed by userId
  - Message send endpoints in `server/src/controller/message.controller.js` decide whether to push based on presence state
- **Expo push sending**:
  - `server/src/services/push/expoPush.service.js` chunks and sends via `expo-server-sdk`

- **Multi-replica Note**: Presence Map is local to each instance. Redis adapter only handles rooms/events, not the presence Map.

#### EAS / Native Credentials Notes
- Android delivery requires **FCM V1** configured in EAS Credentials (Google service account key uploaded to EAS).
- iOS delivery requires APNs setup (via EAS credentials); background/offline push testing needs a real device.
- If `client/android/` exists, native config takes precedence (prebuild/app.json values may not apply in the same way).

## Project-Specific Conventions

### Modules & Features
1. **Auth/Users**: JWT, Zod validation, institutional email (@udg.mx).
   - **User Model**: Includes `career` field (e.g., 'INNI') to persist academic context.
   - **Profile**: Supports photo upload (`PATCH /api/auth/profile`).
2. **Commerces**: One commerce per user, file uploads for logo/banner.
3. **Messaging**: Real-time user↔commerce, persistent chats, Socket.IO
  - **Push notifications**: sent only when recipient is background/offline (presence-aware via Socket.IO + AppState)
4. **Dual-Engine Chatbot**:
   - **Gemini**: Conversational, supports function calling for maps/docs, infers career from history.
   - **Rasa Pro**: Direct, based on Flows (CALM). Uses `rapidfuzz` for fuzzy subject/location resolution.
   - **Persistence**: Both bots synchronize detected careers back to the `User` model in MongoDB.
   - **Grounding**: Both engines use a grounded knowledge base prompt to prevent hallucinations about CUCEI contacts.
   - **Scholar Integration**: Study materials are provided via automated Google Scholar search links, not local files.
5. **UI/UX**:
  > Tabs/stacks navigation, theming via react-native-paper, reusable components, error feedback
   - **Typing Indicator**: Animated three-dot bubble shown while waiting for bot responses.
   - **Model Toggle**: Users can switch between Gemini and Rasa in the Settings screen (persisted via `AsyncStorage`).
   - **Toast**: Custom animated toast (`client/components/Toast.jsx`) renders via Paper `<Portal>` from `Toast.context.jsx`. Supports `success`, `error`, `info` types matching the app theme. Dismissable by swipe-down or tap. Uses Reanimated (`withSpring`/`withTiming`) for enter/exit animations and `react-native-gesture-handler` for gesture detection. **Always call `showToast` from `useToast()` — never use Paper's `<Snackbar>` directly.**
   - **FileInput**: Uses `useToast` internally for upload feedback.
6. **Map**: Interactive CUCEI map, chatbot/map integration via socket.io. Show a toast, if the user click, send her to map screen and show the searched location point.

## Integration Points

### Communication Flow
- **HTTP REST**: CRUD, auth, resources, chatbot history.
- **Socket.IO**: Real-time messaging, chatbot responses
- **External AI**:
  - **Gemini AI**: Node.js service (`server/src/services/gemini/`).
  - **Rasa**: Communicates via REST webhook (`server/src/services/rasa.service.js`) with isolated sessions per `userId`.

## Examples

### Folder Structure Highlights
- **Backend**: `server/src/models/`, `controller/`, `routes/`, `middlewares/`, `services/`, `uploads/`
- **Frontend**: `client/app/`, `components/`, `contexts/`, `hooks/`, `api/`, `assets/`, `styles/`
  - `components/Toast.jsx` — Custom toast component (top-level in `components/`, not inside `common/`)
  - `components/common/` — Shared UI primitives (Input, FileInput, BlurCard, MarkdownText, AnimatedContainer, Background, ShakeView)

## References

## Security & Agent Notes
- Never expose secrets or sensitive logic in the frontend.
- All AI/resource logic must go through the backend.
- **Never commit private keys** (e.g., Google/Firebase service account JSON). Use EAS Credentials / secrets instead.
- `google-services.json` is typically safe to commit for Android apps (not a private key), but treat it as sensitive: Added to .gitignore and only include in native builds.
- Performance is critical: always memoize components and callbacks, optimize FlatLists, and use refs to prevent unnecessary re-fetches.
- **Avoid unnecessary re-renders**: update derived state (e.g., image cache-bust keys) only when the source value actually changes — use `useEffect` with the specific dependency, not `useFocusEffect` unconditionally.
- Animations should be smooth (60fps): use Reanimated's `useSharedValue` and `useAnimatedStyle`.
- **Gestures**: always ensure `GestureHandlerRootView` is the root ancestor when using `GestureDetector`. It is already set up in `layout/providers.layout.jsx`.
- **Image caching**: append `?t=<timestamp>` to image URLs that may update (e.g., profile photos) to force React Native's Image to re-fetch.
- Chatbot history is essential for context and must be kept in sync.
- Folder and file naming follows standard conventions for collaboration.

## Contact & Documentation
- Technical docs: see README.md and `/server/src/schemas/`.

---
_If any section is unclear or missing, please provide feedback to improve these instructions._

# Copilot Instructions for InCUCEI Workspace

## Overview
This workspace contains a multi-component academic assistant system for CUCEI, including:

InCUCEI is a platform for the CUCEI community (Universidad de Guadalajara), providing academic services, messaging, resources, and a dual-engine intelligent assistant (Gemini AI & Rasa Pro). The backend is Node.js/Express, the client is React Native (Expo), and the system is designed for modularity, security, and horizontal scalability via Redis.

## Key Architectural Patterns

### Technologies
- **Backend**: Node.js/Express, MongoDB (Mongoose), Socket.IO, Redis (Adapter for multi-instance), Zod, Gemini AI (Google Generative AI), Rasa Pro (CALM/Flows), Multer, dotenv, Expo Push (`expo-server-sdk`)
- **Frontend**: React Native (Expo), React Navigation/Expo Router, Socket.IO Client, React Native Paper, AsyncStorage, Context API, Axios, FormData, Reanimated 4, Expo Blur, `react-native-gesture-handler` (GestureHandlerRootView, GestureDetector, Gesture), Push (`expo-notifications`)

## Performance Best Practices
- **Memoization**: Use `React.memo()` for components, `useCallback()` for functions, and `useMemo()` for expensive computations
- **FlatList Optimization**: Configure `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, and `initialNumToRender` for large lists
- **Context Usage**: Keep contexts focused and avoid unnecessary re-renders. Use refs to prevent re-fetching data
- **Background Component**: Memoized animated background using global context to maintain animation state across screens
- **Socket.IO Scaling**: Uses Redis adapter (configured via `REDIS_URL`) to share rooms and events between multiple backend instances.

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
  # Run the dual-container setup
  docker compose -f docker-compose.rasa.yml up --build
  ```

### Build & Debug
- **Backend**: Modular controllers, routes, and services. Use Zod for validation, Socket.IO for real-time features.
- **Frontend**: Use Contexts for global state (`contexts/Auth.context.jsx`, `contexts/ChatbotType.context.jsx`, etc.). API logic in `client/api/`. UI theming in `layout/providers.layout.jsx`.
- **Gesture support**: `GestureHandlerRootView` wraps the entire provider tree. Any component using `GestureDetector` (e.g., `Toast.jsx`) must be a descendant of it.
- **Theme**: Material Design 3 with custom color palette. Custom colors include `update`, `delete` for action buttons, and `title`.

#### Push Notifications (Expo + FCM/APNs)
- **Presence gating**: In-memory store in `server/src/app.js` under `app.set('presence', new Map())`. Messages send endpoints decide whether to push based on presence state.
- **Multi-replica Note**: Presence Map is local to each instance. Redis adapter only handles rooms/events, not the presence Map.

## Project-Specific Conventions

### Modules & Features
1. **Auth/Users**: JWT, Zod validation, institutional email (@udg.mx).
   - **User Model**: Includes `career` field (e.g., 'INNI') to persist academic context.
   - **Profile**: Supports photo upload (`PATCH /api/auth/profile`).
2. **Commerces**: One commerce per user, file uploads for logo/banner.
3. **Messaging**: Real-time user↔commerce via Socket.IO.
4. **Dual-Engine Chatbot**:
   - **Gemini**: Conversational, supports function calling for maps/docs, infers career from history.
   - **Rasa Pro**: Direct, based on Flows (CALM). Uses `rapidfuzz` for fuzzy subject, location, and contact resolution.
   - **Persistence**: Both bots synchronize detected careers back to the `User` model in MongoDB.
   - **Contact Info**: Both engines use `data/contact.json` to resolve specific contact information via fuzzy matching.
   - **Scholar Integration**: Study materials are provided via automated Google Scholar search links, not local files.
5. **UI/UX**: 
   - **Typing Indicator**: Animated three-dot bubble shown while waiting for bot responses (shown via `ListHeaderComponent` in inverted list).
   - **Model Toggle**: Users can switch between Gemini and Rasa in the Settings screen (persisted via `AsyncStorage`).
   - **Toast**: Custom animated toast (`client/components/Toast.jsx`) via Paper `<Portal>`. Always call `showToast` from `useToast()`.
   - **Map**: Interactive CUCEI map, chatbot/map integration via socket.io. Shows a toast and can navigate the user directly to the location.

## Integration Points

### Communication Flow
- **HTTP REST**: CRUD, auth, resources, chatbot history.
- **Socket.IO**: Real-time messaging, chatbot responses (`chatbotResponse`), typing indicators (`chatbotTyping`).
- **External AI**:
  - **Gemini AI**: Node.js service (`server/src/services/gemini/`).
  - **Rasa**: Communicates via REST webhook (`server/src/services/rasa.service.js`) with isolated sessions per `userId`.

## Security & Agent Notes
- Never expose secrets or sensitive logic in the frontend.
- All AI/resource logic must go through the backend.
- **Never commit private keys**. Use EAS Credentials / secrets instead.
- Performance is critical: always memoize components and callbacks.
- **Avoid unnecessary re-renders**: update derived state only when source changes.
- Animations: Use Reanimated's `useSharedValue` and `useAnimatedStyle`.
- Chatbot history is essential for context and must be kept in sync.
- Folder and file naming follows standard conventions for collaboration.

## Contact & Documentation
- Technical docs: see README.md and `/server/src/schemas/`.

---
_If any section is unclear or missing, please provide feedback to improve these instructions._

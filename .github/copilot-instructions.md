# Copilot Instructions for InCUCEI Workspace

## Overview
This workspace contains a multi-component academic assistant system for CUCEI, including:

InCUCEI is a platform for the CUCEI community (Universidad de Guadalajara), providing academic services, messaging, resources, and an intelligent assistant (Gemini AI). The backend is Node.js/Express, the client is React Native (Expo), and the system is designed for modularity and security.

## Key Architectural Patterns

### Technologies
- **Backend**: Node.js/Express, MongoDB (Mongoose), Socket.IO, Zod, Gemini AI (Google Generative AI), Multer, dotenv
- **Frontend**: React Native (Expo), React Navigation/Expo Router, Socket.IO Client, React Native Paper, AsyncStorage, Context API, Axios, FormData, Reanimated 4, Expo Blur, `react-native-gesture-handler` (GestureHandlerRootView, GestureDetector, Gesture)

## Performance Best Practices
- **Memoization**: Use `React.memo()` for components, `useCallback()` for functions, and `useMemo()` for expensive computations
- **FlatList Optimization**: Configure `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, and `initialNumToRender` for large lists
- **Context Usage**: Keep contexts focused and avoid unnecessary re-renders. Use refs to prevent re-fetching data
- **Background Component**: Memoized animated background using global context to maintain animation state across screens

## Developer Workflows
  ```bash
  pyenv local 3.11.9
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  ```

### Build & Debug
- **Backend**: Modular controllers, routes, and services. Use Zod for validation, Socket.IO for real-time features, and Multer for file uploads.
- **Frontend**: Use Contexts for global state (`contexts/Auth.context.jsx`, `contexts/Toast.context.jsx`, `contexts/Socket.context.jsx`, `contexts/BackgroundAnimation.context.jsx`). API logic in `client/api/`. UI theming in `layout/providers.layout.jsx`.
- **Gesture support**: `GestureHandlerRootView` wraps the entire provider tree in `layout/providers.layout.jsx`. Any component using `GestureDetector` (e.g., `Toast.jsx`) must be a descendant of it.
- **Chatbot**: Gemini AI integration via backend proxy.
- **Theme**: Material Design 3 with custom color palette optimized for accessibility (WCAG AA compliance). Custom colors include `update`, `delete` for action buttons.

## Project-Specific Conventions

### Modules & Features
1. **Auth/Users**: JWT, Zod validation, institutional email (@udg.mx). Supports profile photo upload via `PATCH /api/auth/profile` (imageType `profile`). `profileUrl` stored in user model and in Auth context.
2. **Commerces**: One commerce per user, file uploads (logo/banner via imageType `logo`/`banner`)
3. **Messaging**: Real-time user↔commerce, persistent chats, Socket.IO
4. **Chatbot (Gemini)**: Contextual conversation, resource delivery, map integration
5. **UI/UX**: Tabs/stacks navigation, theming, reusable components, error feedback
   - **Toast**: Custom animated toast (`client/components/Toast.jsx`) renders via Paper `<Portal>` from `Toast.context.jsx`. Supports `success`, `error`, `info` types matching the app theme. Dismissable by swipe-down or tap. Uses Reanimated (`withSpring`/`withTiming`) for enter/exit animations and `react-native-gesture-handler` for gesture detection. **Always call `showToast` from `useToast()` — never use Paper's `<Snackbar>` directly.**
   - **FileInput**: Uses `useToast` internally for upload feedback.
6. **Map (pending)**: Interactive CUCEI map, chatbot/map integration

## Integration Points

### Communication Flow
- **HTTP REST**: CRUD, auth, resources, chatbot history
- **Socket.IO**: Real-time messaging, chatbot responses
- **Gemini AI**: Backend proxy, context aggregation, history persistence

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
- Performance is critical: always memoize components and callbacks, optimize FlatLists, and use refs to prevent unnecessary re-fetches.
- **Avoid unnecessary re-renders**: update derived state (e.g., image cache-bust keys) only when the source value actually changes — use `useEffect` with the specific dependency, not `useFocusEffect` unconditionally.
- Animations should be smooth (60fps): use Reanimated's `useSharedValue` and `useAnimatedStyle`.
- **Gestures**: always ensure `GestureHandlerRootView` is the root ancestor when using `GestureDetector`. It is already set up in `layout/providers.layout.jsx`.
- **Image caching**: append `?t=<timestamp>` to image URLs that may update (e.g., profile photos) to force React Native's Image to re-fetch.
- Chatbot history is essential for context and must be kept in sync.
- Folder and file naming follows standard conventions for collaboration.

## For New Features & Gemini Integration
- Review `/server/src/services/gemini.service.js` for Gemini API usage.
- Use modular architecture and existing contexts/hooks for new features.

## Contact & Documentation
- Technical docs: see README.md and `/server/src/schemas/`.

---
_If any section is unclear or missing, please provide feedback to improve these instructions._

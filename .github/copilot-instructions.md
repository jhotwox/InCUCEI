# Copilot Instructions for InCUCEI Workspace

## Overview
This workspace contains a multi-component academic assistant system for CUCEI, including:

InCUCEI is a platform for the CUCEI community (Universidad de Guadalajara), providing academic services, messaging, resources, and an intelligent assistant (Gemini AI). The backend is Node.js/Express, the client is React Native (Expo), and the system is designed for modularity and security.

## Key Architectural Patterns

### Technologies
- **Backend**: Node.js/Express, MongoDB (Mongoose), Socket.IO, Zod, Gemini AI (Google Generative AI), Multer, dotenv
- **Frontend**: React Native (Expo), React Navigation/Expo Router, Socket.IO Client, React Native Paper, AsyncStorage, Context API, Axios, FormData

## Developer Workflows
  ```bash
  pyenv local 3.11.9
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  ```

### Build & Debug
- **Backend**: Modular controllers, routes, and services. Use Zod for validation, Socket.IO for real-time features, and Multer for file uploads.
- **Frontend**: Use Contexts for global state (`contexts/Auth.context.jsx`, `contexts/SnackBar.context.jsx`, `contexts/Socket.context.jsx`). API logic in `client/api/`. UI theming in `layout/Providers.layout.jsx`.
- **Chatbot**: Gemini AI integration via backend proxy.

## Project-Specific Conventions

### Modules & Features
1. **Auth/Users**: JWT, Zod validation, institutional email (@udg.mx)
2. **Commerces**: One commerce per user, file uploads (logo/banner)
3. **Messaging**: Real-time user↔commerce, persistent chats, Socket.IO
4. **Chatbot (Gemini)**: Contextual conversation, resource delivery, map integration
5. **UI/UX**: Tabs/stacks navigation, theming, reusable components, error feedback
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

## References

## Security & Agent Notes
- Never expose secrets or sensitive logic in the frontend.
- All AI/resource logic must go through the backend.
- Chatbot history is essential for context and must be kept in sync.
- Folder and file naming follows standard conventions for collaboration.

## For New Features & Gemini Integration
- Review `/server/src/services/gemini.service.js` for Gemini API usage.
- Use modular architecture and existing contexts/hooks for new features.

## Contact & Documentation
- Technical docs: see README.md and `/server/src/schemas/`.

---
_If any section is unclear or missing, please provide feedback to improve these instructions._

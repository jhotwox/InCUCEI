import { Stack } from "expo-router"

/**
 * Stack Navigator para la sección de Mensajes.
 * 
 * El index.jsx maneja la lógica de mostrar:
 * - Tabs (Chats + Ventas) si el usuario tiene comercio
 * - Solo Chats si no tiene comercio
 * 
 * Pantallas adicionales:
 * - PrivateChat: Detalle de conversación usuario-usuario
 * - [commerceId]: Detalle de conversación de negocio
 */
export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animationEnabled: true,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="PrivateChat"
        options={{
          animationEnabled: true,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="[commerceId]"
        options={{
          animationEnabled: true,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="ChatsTab"
        options={{
          animationEnabled: true,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="VentasTab"
        options={{
          animationEnabled: true,
          animationDuration: 200,
        }}
      />
    </Stack>
  )
}

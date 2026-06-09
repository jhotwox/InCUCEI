import { Tabs } from "expo-router"
import { Icon, useTheme } from "react-native-paper"

/**
 * MessagesTabs - Navegación con tabs para Chats y Ventas
 * Se muestra solo cuando el usuario tiene un negocio
 */
export default function MessagesTabs() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.primary,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 12,
          textTransform: "none",
        },
      }}
    >
      {/* Tab de Chats - Conversaciones usuario-usuario */}
      <Tabs.Screen
        name="ChatsTab"
        options={{
          title: "Chats",
          tabBarLabel: "Chats",
          tabBarIcon: ({ focused, color }) => (
            <Icon
              size={24}
              source={focused ? "message" : "message-outline"}
              color={color}
            />
          ),
        }}
      />

      {/* Tab de Ventas - Mensajes del negocio */}
      <Tabs.Screen
        name="VentasTab"
        options={{
          title: "Ventas",
          tabBarLabel: "Ventas",
          tabBarIcon: ({ focused, color }) => (
            <Icon
              size={24}
              source={focused ? "shopping-bag" : "shopping-bag-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}

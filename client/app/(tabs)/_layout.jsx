import { Tabs } from "expo-router"
import { Icon, useTheme } from "react-native-paper"

export default () => {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen
        name="Home.screen"
        options={{
          title: "Asistente",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="handshake" theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Map.screen"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="map" theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Sales.screen"
        options={{
          title: "Ventas",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="purse" theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings.screen"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="account" theme={theme} />
          ),
        }}
      />
    </Tabs>
  )
}

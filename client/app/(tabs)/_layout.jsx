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
        animation: 'shift',
        animationDuration: 200,
      }}
    >
      {/* If  */}
      <Tabs.Screen
        name="Home.screen"
        options={{
          title: "Asistente",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={28} source={focused ? "handshake" : "handshake-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Map.screen"
        options={{
          title: "Mapa",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={28} source={focused ? "map" : "map-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Sales.screen"
        options={{
          title: "Ventas",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={28} source={focused ? "purse" : "purse-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings.screen"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={28} source={focused ? "account" : "account-outline"} theme={theme} />
          ),
        }}
      />
    </Tabs>
  )
}

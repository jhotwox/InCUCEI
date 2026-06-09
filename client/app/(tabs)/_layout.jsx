import { LinearGradient } from "expo-linear-gradient"
import { Tabs } from "expo-router"
import { View } from "react-native"
import { Icon, useTheme } from "react-native-paper"

export default () => {
  const theme = useTheme()
  const borderRadius = 24

  const Background = () => (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.05)']}
        style={{ flex: 1, borderRadius }}
      />
    </View>
  )

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        sceneStyle: {
          // MARGIN PARA EL TAB BAR
          // paddingBottom: 56,
        },
        tabBarStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          position: "absolute",
          bottom: 12,
          borderRadius,
          marginHorizontal: 8,
          // I don't know why the height doesn't work but this makes it look better
          height: "2px",
          borderWidth: 1,
          borderColor: theme.colors.surface + "88",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
          backgroundColor: theme.colors.surface + "55",
          paddingHorizontal: 4,
          borderRadius: 12
        },
        animation: 'shift',
        animationDuration: 200,
        tabBarBackground: Background,
      }}
    >
      
      <Tabs.Screen
        name="Home.screen"
        options={{
          title: "Asistente",
          tabBarIcon: ({ focused }) => (
            <Icon size={28} source={focused ? "handshake" : "handshake-outline"} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="Map.screen"
        options={{
          title: "Mapa",
          tabBarIcon: ({ focused }) => (
            <Icon size={28} source={focused ? "map" : "map-outline"} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="Sales.screen"
        options={{
          title: "Ventas",
          tabBarIcon: ({ focused }) => (
            <Icon size={28} source={focused ? "purse" : "purse-outline"} theme={theme} />
          ),
        }}
      />

      {/* NUEVA PESTAÑA */}
      <Tabs.Screen
        name="Chats.screen"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="chat" theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="Settings.screen"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <Icon size={28} source={focused ? "account" : "account-outline"} theme={theme} />
          ),
        }}
      />
    </Tabs>
  )
}
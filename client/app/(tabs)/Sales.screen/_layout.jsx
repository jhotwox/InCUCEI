import { Tabs } from "expo-router"
import { Icon, useTheme } from "react-native-paper"
import { useEffect } from "react"

export default () => {
  const theme = useTheme()

  useEffect(() => {
    // This will run when the component mounts
    console.log("Sales layout mounted")

    // Fetch commerces

    // Return a cleanup function that runs when the component unmounts
    return () => {
      console.log("Sales layout unmounted")
    }
  }, []) // Empty dependency array ensures this runs only on mount and unmount

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: "top",
        tabBarActiveTintColor: theme.colors.primary,
        tabbaarinactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
          shadowOpacity: 0.1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        animation: 'shift',
        animationDuration: 250,
      }}
      initialRouteName="Shop.screen"
    >
      <Tabs.Screen
        name="ChatList.screen"
        options={{
          title: "Mis chats",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={24} source={focused ? "chat" : "chat-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="CommerceChatList.screen"
        options={{
          title: "Clientes",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={24} source={focused ? "account-group" : "account-group-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Shop.screen"
        options={{
          title: "Tienda",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={24} source={focused ? "store" : "store-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Commerce.screen"
        options={{
          title: "Mi Comercio",
          tabBarIcon: ({ focused, color }) => (
            <Icon size={24} source={focused ? "shopping" : "shopping-outline"} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="Chat.screen"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

import { Stack } from 'expo-router'
import { StatusBar } from "expo-status-bar"
import { Providers } from "../layout/providers.layout"
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function App () {
  
  return (
    <Providers>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade',
            animationDuration: 200,
          }} 
          initialRouteName='(auth)' 
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GestureHandlerRootView>
    </Providers>
  )
}
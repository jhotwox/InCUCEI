import { Stack } from 'expo-router'
import { StatusBar } from "expo-status-bar"
import { Text, TextInput } from "react-native"
import { Providers } from "../layout/providers.layout"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Markdown from 'react-native-markdown-display'

const FONTFAMILY = "Lexend"
// const FONTFAMILY = "PlusJakartaSans"

// Configurar fuente predeterminada para todos los Text de React Native
if (Text.defaultProps == null) {
  Text.defaultProps = {}
}
Text.defaultProps.style = { fontFamily: FONTFAMILY }

// Configurar fuente predeterminada para todos los TextInput de React Native
if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {}
}
TextInput.defaultProps.style = { fontFamily: FONTFAMILY }


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
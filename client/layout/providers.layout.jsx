import { PaperProvider, MD3LightTheme } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"
import { ActivityIndicator, View } from "react-native"
import { ToastProvider } from "../contexts/Toast.context"
import { AuthProvider } from "../contexts/Auth.context"
import { SocketProvider } from "../contexts/Socket.context"
import { BackgroundAnimationProvider } from "../contexts/BackgroundAnimation.context"

const FONTFAMILY = "Lexend"
// const FONTFAMILY = "PlusJakartaSans"

export const Providers = ({ children }) => {
  const [fontsLoaded] = useFonts({
    'Lexend': require('../assets/fonts/Lexend-VariableFont_wght.ttf'),
    'PlusJakartaSans': require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf'),
    'PlusJakartaSans-Italic': require('../assets/fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf')
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  const theme = {
    ...MD3LightTheme,
    fonts: {
      ...MD3LightTheme.fonts,
      default: {
        fontFamily: FONTFAMILY,
      },
      displayLarge: {
        ...MD3LightTheme.fonts.displayLarge,
        fontFamily: FONTFAMILY,
      },
      displayMedium: {
        ...MD3LightTheme.fonts.displayMedium,
        fontFamily: FONTFAMILY,
      },
      displaySmall: {
        ...MD3LightTheme.fonts.displaySmall,
        fontFamily: FONTFAMILY,
      },
      headlineLarge: {
        ...MD3LightTheme.fonts.headlineLarge,
        fontFamily: FONTFAMILY,
      },
      headlineMedium: {
        ...MD3LightTheme.fonts.headlineMedium,
        fontFamily: FONTFAMILY,
      },
      headlineSmall: {
        ...MD3LightTheme.fonts.headlineSmall,
        fontFamily: FONTFAMILY,
      },
      titleLarge: {
        ...MD3LightTheme.fonts.titleLarge,
        fontFamily: FONTFAMILY,
      },
      titleMedium: {
        ...MD3LightTheme.fonts.titleMedium,
        fontFamily: FONTFAMILY,
      },
      titleSmall: {
        ...MD3LightTheme.fonts.titleSmall,
        fontFamily: FONTFAMILY,
      },
      labelLarge: {
        ...MD3LightTheme.fonts.labelLarge,
        fontFamily: FONTFAMILY,
      },
      labelMedium: {
        ...MD3LightTheme.fonts.labelMedium,
        fontFamily: FONTFAMILY,
      },
      labelSmall: {
        ...MD3LightTheme.fonts.labelSmall,
        fontFamily: FONTFAMILY,
      },
      bodyLarge: {
        ...MD3LightTheme.fonts.bodyLarge,
        fontFamily: FONTFAMILY,
      },
      bodyMedium: {
        ...MD3LightTheme.fonts.bodyMedium,
        fontFamily: FONTFAMILY,
      },
      bodySmall: {
        ...MD3LightTheme.fonts.bodySmall,
        fontFamily: FONTFAMILY,
      },
    },
    colors: {
      ...MD3LightTheme.colors,
      // Verde principal más brillante para mejor contraste
      primary: "#00695C",
      onPrimary: "#FFFFFF",
      primaryContainer: "#4DB6AC",
      onPrimaryContainer: "#002019",

      // Secondary con mejor contraste (azul-verde)
      secondary: "#0097A7",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#B2EBF2",
      onSecondaryContainer: "#001F24",

      // Tertiary mantiene el naranja/amarillo para acentos
      tertiary: "#FF9800",
      onTertiary: "#FFFFFF",
      tertiaryContainer: "#FFE0B2",
      onTertiaryContainer: "#331C00",

      // Fondos más limpios
      background: "#FAFAFA",
      onBackground: "#1A1C1E",

      surface: "#FFFFFF",
      onSurface: "#1A1C1E",
      surfaceVariant: "#E0F2F1",
      onSurfaceVariant: "#3F4948",

      surfaceDisabled: "rgba(0, 105, 92, 0.12)",
      onSurfaceDisabled: "rgba(0, 105, 92, 0.38)",

      // Error más visible
      error: "#D32F2F",
      onError: "#FFFFFF",
      errorContainer: "#FFCDD2",
      onErrorContainer: "#5F0016",

      outline: "#70796D",
      outlineVariant: "#BFC9C4",

      inverseSurface: "#2D3130",
      inverseOnSurface: "#EFF1EF",
      inversePrimary: "#80CBC4",

      shadow: "#000000",
      scrim: "rgba(0,0,0,0.5)",

      // Colores personalizados para acciones
      update: "#2196F3",
      onUpdate: "#FFFFFF",
      updateContainer: "#BBDEFB",
      onUpdateContainer: "#001D35",

      delete: "#F44336",
      onDelete: "#FFFFFF",
      deleteContainer: "#FFCDD2",
      onDeleteContainer: "#5F0016",

      title: "#FFCA87",

      elevation: {
        level0: "transparent",
        level1: "#E8F5E9",
        level2: "#C8E6C9",
        level3: "#A5D6A7",
        level4: "#81C784",
        level5: "#66BB6A",
      },
    },
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <BackgroundAnimationProvider>
            <ToastProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </ToastProvider>
          </BackgroundAnimationProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}

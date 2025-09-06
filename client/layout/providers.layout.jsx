import { PaperProvider, MD3LightTheme } from "react-native-paper"

export const Providers =  ({ children }) => {
  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#004439',
      onPrimary: '#FFFFFF',
      primaryContainer: '#26A69A',
      onPrimaryContainer: '#00251A',

      secondary: '#00796B',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#B2DFDB',
      onSecondaryContainer: '#00332C',

      tertiary: '#FFB300',
      onTertiary: '#00251A',
      tertiaryContainer: '#FFF8E1',
      onTertiaryContainer: '#4E2600',

      background: '#F6F6F6',
      onBackground: '#00251A',

      surface: '#FFFFFF',
      onSurface: '#004439',
      surfaceVariant: '#E0F2F1',
      onSurfaceVariant: '#004439',

      surfaceDisabled: 'rgba(0, 68, 57, 0.12)',
      onSurfaceDisabled: 'rgba(0, 68, 57, 0.38)',

      error: '#B00020',
      onError: '#FFFFFF',
      errorContainer: '#FCD8DF',
      onErrorContainer: '#370617',

      outline: '#26A69A',
      outlineVariant: '#B2DFDB',

      inverseSurface: '#004439',
      inverseOnSurface: '#FFFFFF',
      inversePrimary: '#26A69A',

      shadow: '#000000',
      scrim: 'rgba(0,0,0,0.32)',

      elevation: {
        level0: 'transparent',
        level1: '#E0F2F1',
        level2: '#B2DFDB',
        level3: '#80CBC4',
        level4: '#4DB6AC',
        level5: '#26A69A',
      },
    },
  }
  
  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  )
}
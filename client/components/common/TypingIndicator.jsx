import { View, StyleSheet } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated"
import { useTheme } from "react-native-paper"

/**
 * TypingIndicator - Componente que muestra tres puntos animados indicando que alguien está escribiendo.
 * Los puntos suben y bajan secuencialmente creando un efecto de "digitación".
 * 
 * @component
 * @example
 * <TypingIndicator />
 * 
 * @returns {JSX.Element} Tres puntos animados
 */
export default function TypingIndicator() {
  const theme = useTheme()

  // Cada punto tiene su propio valor animado
  const dot1 = useSharedValue(0)
  const dot2 = useSharedValue(0)
  const dot3 = useSharedValue(0)

  // Animación: levanta y baja en secuencia
  const animateDot = (sharedValue) => {
    sharedValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.ease }),
        withTiming(0, { duration: 300, easing: Easing.ease })
      ),
      -1,
      true
    )
  }

  // Iniciar animaciones cuando el componente monta (con delays para secuencia)
  React.useEffect(() => {
    setTimeout(() => animateDot(dot1), 0)
    setTimeout(() => animateDot(dot2), 150)
    setTimeout(() => animateDot(dot3), 300)
  }, [])

  // Estilos animados para cada punto
  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value * -8 }],
  }))

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value * -8 }],
  }))

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value * -8 }],
  }))

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: theme.colors.primary },
          animatedStyle1,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: theme.colors.primary },
          animatedStyle2,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: theme.colors.primary },
          animatedStyle3,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

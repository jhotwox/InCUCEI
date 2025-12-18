import { StyleSheet, View, Dimensions } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeIn } from 'react-native-reanimated'
import { useTheme } from 'react-native-paper'
import { useFocusEffect } from 'expo-router'
import Svg, { Path } from 'react-native-svg'
import { useCallback } from 'react'
import { topography } from '../../assets/backgrounds'

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window')

/**
 * Animated background component that renders a full-screen SVG path and continuously animates its position.
 *
 * @param {{background?: string|null, color?: string|null}} props
 * @param {string|null} [background=null] - Background color for the container. If null, defaults to theme.colors.onSurfaceDisabled.
 * @param {string|null} [color=null] - Fill color for the SVG path. If null, defaults to theme.colors.primary.
 * @returns {JSX.Element} A view that fills the screen containing an animated SVG decorative background (pointerEvents set to 'none').
 *
 * @remarks
 * - Uses useTheme() for default colors.
 * - Uses useSharedValue, useAnimatedStyle and withRepeat/withTiming to drive a continuous translation animation.
 * - Animation is started on focus via useFocusEffect.
 * - The SVG dimensions depend on externally defined WIDTH and HEIGHT and the path data provided by topography.d.
 */

export default ({ background = null, color = null }) => {
  const theme = useTheme()
  const offset = useSharedValue(0)

  useFocusEffect(
    useCallback(() => {
      offset.value = 0
      offset.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    }, [])
  )

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: -600 + offset.value * 20 },
      { translateY: -400 + offset.value * 10 },
      // { rotate: interpolate(offset.value, [0, 1], [0, 359], Extrapolation.CLAMP) + 'deg' }  // Example rotation, can be adjusted or removed
    ]
  }))

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: background === null ? theme.colors.onSurfaceDisabled : background }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyles]} pointerEvents={'none'}>
        <Svg width={WIDTH * 3} height={HEIGHT * 3} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Path
            fill={color === null ? theme.colors.primary : color}
            d={topography.d}
          />
        </Svg>
      </Animated.View>
    </View>
  )
}
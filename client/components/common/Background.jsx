import { StyleSheet, Dimensions } from 'react-native'
import Animated, { useAnimatedStyle, FadeIn } from 'react-native-reanimated'
import { useTheme } from 'react-native-paper'
import Svg, { Path } from 'react-native-svg'
import { topography } from '../../assets/backgrounds'
import { useBackgroundAnimation } from '../../contexts/BackgroundAnimation.context'
import { memo } from 'react'

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
 * - Uses shared animation state from BackgroundAnimationContext to maintain consistent animation across screens.
 * - Includes FadeIn animation when mounting for smooth transitions.
 * - Memoized for performance optimization.
 * - The SVG dimensions are optimized (1.5x instead of 3x) to reduce processing load.
 */

const Background = ({ background = null, color = null }) => {
  const theme = useTheme()
  const { offset } = useBackgroundAnimation()

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: -400 + offset.value * 20 },
      { translateY: -300 + offset.value * 15 },
    ]
  }))

  const bgColor = background === null ? theme.colors.onSurfaceDisabled : background
  const fillColor = color === null ? theme.colors.primary : color

  return (
    <Animated.View 
      // entering={FadeIn.duration(300)} 
      style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyles]} pointerEvents={'none'}>
        <Svg 
          width={WIDTH * 1.5}
          height={HEIGHT} 
          viewBox={`0 0 ${WIDTH} ${HEIGHT * 1/2}`} 
          style={{ position: 'absolute', top: 0, left: 0 }}
          transform={`scale(2)`}
        >
          <Path
            fill={fillColor}
            d={topography.d}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  )
}

export default memo(Background)
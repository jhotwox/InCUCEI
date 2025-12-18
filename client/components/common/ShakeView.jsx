import { forwardRef, useImperativeHandle } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withTiming } from 'react-native-reanimated'

/**
 * ShakeView - a forwardRef Animated.View wrapper that exposes an imperative `shake()` method.
 *
 * @param {Object} props - Component properties.
 * @param {import('react-native').StyleProp<import('react-native').ViewStyle>} [props.style={}] - Optional style applied to the Animated.View container.
 * @param {React.ReactNode} [props.children] - Child elements to be rendered inside the Animated.View.
 * @param {React.Ref<{shake: () => void}>} ref - Forwarded ref exposing a `shake()` method which triggers a short horizontal shake animation.
 * @returns {JSX.Element} An Animated.View that can be shaken programmatically via the ref.
 */

export default forwardRef(({ style = {}, children }, ref) => {
  const animated = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(animated.value, [-1, 1], [-5, 5], Extrapolation.CLAMP) }
    ]
  }))
  
  useImperativeHandle(ref, () => ({
      shake: () => {
        let count = 0
        const interval = setInterval(() => {
          const targetValue = count % 2 === 0 ? 1 : -1
          animated.value = withTiming(targetValue, { duration: 50 })
          count++
          if (count >= 8) {
            clearInterval(interval)
            animated.value = withTiming(0, { duration: 50 })
          }
        }, 50)
       },
    }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  )
}) 
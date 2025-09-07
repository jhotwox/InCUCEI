import { forwardRef, useImperativeHandle } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withTiming } from 'react-native-reanimated'

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
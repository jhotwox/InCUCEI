import { useState, useCallback, useRef, useEffect } from 'react'
import { useFocusEffect } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { View, ScrollView } from 'react-native'

/**
 * AnimatedContainer component that wraps children with staggered enter animations.
 * 
 * @param {Object} props
 * @param {React.ReactNode[]} props.children - Array of components to animate
 * @param {number[]} [props.delays] - Custom delay array for each child (in ms). If not provided, auto-generates: [200, 400, 600, ...]
 * @param {number} [props.baseDelay=200] - Base delay increment when auto-generating delays
 * @param {number} [props.duration=800] - Duration of each animation in ms
 * @param {'fadeInDown'|'fadeInUp'} [props.animation='fadeInDown'] - Animation type
 * @param {boolean} [props.resetOnFocus=false] - Whether to reset animations when screen receives focus
 * @param {Object} [props.style] - Additional style for container
 * @param {boolean} [props.scroll=false] - If true, wraps children in a ScrollView
 * @param {Object} [props.scrollProps] - Extra props for ScrollView
 * @returns {JSX.Element}
 */
export default ({
  children,
  delays = null,
  baseDelay = 200,
  duration = 800,
  animation = 'fadeInDown',
  resetOnFocus = false,
  style,
  scroll = true,
  scrollProps = {},
}) => {
  const [animationKey, setAnimationKey] = useState(0)
  const hasMounted = useRef(false)

  useEffect(() => {
    hasMounted.current = true
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (resetOnFocus && hasMounted.current) {
        setAnimationKey((k) => k + 1)
      }
    }, [resetOnFocus])
  )

  const getAnimation = (index) => {
    const baseAnimation = animation === 'fadeInUp' 
      ? FadeInUp.duration(duration).springify()
      : FadeInDown.duration(duration).springify()
    const delay = delays ? delays[index] || 0 : index * baseDelay
    return delay === 0 ? baseAnimation : baseAnimation.delay(delay)
  }

  const childrenArray = Array.isArray(children) ? children : [children]

  const content = childrenArray.map((child, index) => (
    <Animated.View
      key={index}
      entering={getAnimation(index)}
    >
      {child}
    </Animated.View>
  ))

  if (scroll) {
    return (
      <ScrollView style={style} {...scrollProps}>
        {content}
      </ScrollView>
    )
  }

  return <View style={style}>{content}</View>
}
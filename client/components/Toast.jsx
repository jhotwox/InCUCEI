import { useEffect, useCallback, useRef } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { Text, useTheme, IconButton } from "react-native-paper"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"

const SWIPE_THRESHOLD = 40

const TYPE_CONFIG = {
  success: { icon: "check-circle-outline" },
  error:   { icon: "alert-circle-outline" },
  info:    { icon: "information-outline" },
}

/**
 * Personalized Toast with reanimated animation and support for
 * slide/tap gestures to delete toast.
 *
 * @param {boolean} visible - Check if the toast is visible
 * @param {string}  message - Toast text
 * @param {"success"|"error"|"info"} type - Toast visual type
 * @param {number}  duration - Time in ms before auto-closing
 * @param {function} onDismiss - Callback when dismissed (after animation)
 */
export const Toast = ({ visible, message, type = "info", duration = 2500, onDismiss, onClick }) => {
  const theme = useTheme()
  const translateY = useSharedValue(120)
  const opacity    = useSharedValue(0)
  const swipeY     = useSharedValue(0)
  const timerRef   = useRef(null)

  const colorMap = {
    success: {
      bg:     theme.colors.primary,
      text:   theme.colors.onPrimary,
      accent: "#004D40",
    },
    error: {
      bg:     theme.colors.error,
      text:   theme.colors.onError,
      accent: "#B71C1C",
    },
    info: {
      bg:     theme.colors.tertiary,
      text:   theme.colors.onTertiary,
      accent: "#E65100",
    },
  }

  const colors = colorMap[type] ?? colorMap.info
  const config  = TYPE_CONFIG[type] ?? TYPE_CONFIG.info

  // ── Dismiss (JS thread) ──────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onDismiss?.()
  }, [onDismiss])

  // ── Animate out from JS thread (timer) ─────────────────────────────────
  const animateOutJS = useCallback(() => {
    swipeY.value     = withTiming(0, { duration: 0 })
    translateY.value = withTiming(120, { duration: 280 })
    opacity.value    = withTiming(0, { duration: 280 }, (finished) => {
      if (finished) runOnJS(dismiss)()
    })
  }, [dismiss])

  // ── Enter / auto-dismiss ─────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return

    swipeY.value     = 0
    translateY.value = withSpring(0, { damping: 18, stiffness: 180, overshootClamping: false })
    opacity.value    = withTiming(1, { duration: 220 })

    timerRef.current = setTimeout(animateOutJS, duration)

    return () => clearTimeout(timerRef.current)
  }, [visible, duration])

  // ── Gestures (UI thread  →  worklets inline) ─────────────────────────────
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) swipeY.value = e.translationY
    })
    .onEnd((e) => {
      if (e.translationY > SWIPE_THRESHOLD) {
        translateY.value = withTiming(120, { duration: 260 })
        opacity.value    = withTiming(0,   { duration: 260 }, (finished) => {
          if (finished) runOnJS(dismiss)()
        })
      } else {
        swipeY.value = withSpring(0)
      }
    })

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      translateY.value = withTiming(120, { duration: 260 })
      opacity.value    = withTiming(0,   { duration: 260 }, (finished) => {
        if (finished) runOnJS(dismiss)()
      })
    })

  const composed = Gesture.Race(panGesture, tapGesture)

  // ── Animated style ───────────────────────────────────────────────────────
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + Math.max(0, swipeY.value) }],
    opacity: opacity.value,
  }))

  if (!visible) return null

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[styles.container, { backgroundColor: colors.bg }, animatedStyle]}
      >
        {/* Accent lateral slice */}
        {/* <View style={[styles.leftStrip, { backgroundColor: colors.accent }]} /> */}

        {/* Type icon */}
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={colors.text}
          style={styles.typeIcon}
        />

        {/* Message */}
        <Text
          numberOfLines={2}
          style={[styles.message, { color: colors.text }]}
        >
          {message}
        </Text>

        {onClick && (
          <IconButton
            icon="arrow-right"
            size={24}
            onPress={onClick}
            iconColor={theme.colors.onPrimary}
          />
        )}

        {/* Close icon */}
        {/* <MaterialCommunityIcons
          name="close"
          size={18}
          color={colors.text}
          style={styles.closeIcon}
        /> */}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: "hidden",
    minHeight: 56,
  },
  leftStrip: {
    width: 5,
    alignSelf: "stretch",
  },
  typeIcon: {
    marginLeft: 14,
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    paddingVertical: 14,
  },
  // closeIcon: {
  //   marginHorizontal: 14,
  //   opacity: 0.85,
  // },
})

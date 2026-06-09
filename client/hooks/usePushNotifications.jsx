import { useEffect, useRef } from "react"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { requireOptionalNativeModule } from "expo-modules-core"
import { registerPushTokenRequest } from "../api/auth.api"

const STORAGE_KEY_PREFIX = "expoPushToken"

export const usePushNotifications = ({ enabled, userId }) => {
  const registeringRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (!userId) return
    if (registeringRef.current) return

    let cancelled = false

    const run = async () => {
      try {
        registeringRef.current = true

        const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`

        // If the native module isn't present (common when using a dev client that
        // hasn't been rebuilt after installing expo-notifications), just no-op.
        const expoPushTokenManager = requireOptionalNativeModule(
          "ExpoPushTokenManager"
        )
        if (!expoPushTokenManager) return

        const Notifications = await import("expo-notifications")

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          })
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync()

        let finalStatus = existingStatus
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }

        if (finalStatus !== "granted") return

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId

        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        })

        const expoPushToken = tokenResponse?.data
        if (!expoPushToken) return

        const stored = await AsyncStorage.getItem(storageKey)
        if (stored === expoPushToken) return

        if (cancelled) return

        await registerPushTokenRequest(expoPushToken)
        await AsyncStorage.setItem(storageKey, expoPushToken)
      } catch (err) {
        console.log("[-] Push notification setup error:", err)
      } finally {
        registeringRef.current = false
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [enabled, userId])
}

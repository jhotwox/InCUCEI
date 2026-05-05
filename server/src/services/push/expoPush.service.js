import { Expo } from "expo-server-sdk"

const expo = new Expo()

export const toExpoMessages = ({ tokens, title, body, data }) => {
  if (!Array.isArray(tokens) || tokens.length === 0) return []

  return tokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((t) => ({
      to: t,
      sound: "default",
      title,
      body,
      data,
    }))
}

export const sendExpoPushNotifications = async (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return

  const allTickets = []
  const receiptIds = []
  const chunks = expo.chunkPushNotifications(messages)
  for (const chunk of chunks) {
    try {
      // tickets can be used later with expo.getPushNotificationReceiptsAsync
      const tickets = await expo.sendPushNotificationsAsync(chunk)
      allTickets.push(...tickets)

      for (const ticket of tickets) {
        if (ticket?.status === "error") {
          console.error("[-] Expo push ticket error:", ticket)
        } else if (ticket?.id) {
          receiptIds.push(ticket.id)
        }
      }
    } catch (err) {
      console.error("[-] Expo push send error:", err)
    }
  }

  return allTickets
}

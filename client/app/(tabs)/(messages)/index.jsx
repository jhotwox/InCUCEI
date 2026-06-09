import { useState, useEffect } from "react"
import { View, ActivityIndicator, StyleSheet, ScrollView } from "react-native"
import { useTheme, Button } from "react-native-paper"
import { getCommerce } from "../../../api/commerce.api"
import { useAuth } from "../../../contexts/Auth.context"
import ChatsTabScreen from "./ChatsTab"
import VentasTabScreen from "./VentasTab"

/**
 * Messages Index - Pantalla principal condicional
 * 
 * Renderiza:
 * - Si tiene comercio: Tabs con Chats y Ventas
 * - Si no tiene comercio: Solo vista de Chats
 */
export default function MessagesIndex() {
  const theme = useTheme()
  const { user } = useAuth()
  const [hasCommerce, setHasCommerce] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chats")

  // Verificar si el usuario tiene negocio
  useEffect(() => {
    const checkCommerce = async () => {
      try {
        if (user?.id) {
          const response = await getCommerce()
          const hasCommerceData = !!response?.data?.commerce
          setHasCommerce(hasCommerceData)
        }
      } catch (err) {
        console.log("[Messages] No commerce found or error:", err.message)
        setHasCommerce(false)
      } finally {
        setLoading(false)
      }
    }

    checkCommerce()
  }, [user?.id])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  // Si no tiene comercio, mostrar solo Chats
  if (!hasCommerce) {
    return <ChatsTabScreen />
  }

  // Si tiene comercio, mostrar tabs
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
        <Button
          mode={activeTab === "chats" ? "contained" : "text"}
          onPress={() => setActiveTab("chats")}
          style={styles.tabButton}
          labelStyle={styles.tabLabel}
        >
          Chats
        </Button>
        <Button
          mode={activeTab === "ventas" ? "contained" : "text"}
          onPress={() => setActiveTab("ventas")}
          style={styles.tabButton}
          labelStyle={styles.tabLabel}
        >
          Ventas
        </Button>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "chats" && <ChatsTabScreen />}
        {activeTab === "ventas" && <VentasTabScreen />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 24,
    paddingBottom: 12,
  },
  tabButton: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "none",
  },
})

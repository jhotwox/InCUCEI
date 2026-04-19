import { useCallback, useEffect, useState } from "react"
import { FlatList, View } from "react-native"
import { Text, useTheme } from "react-native-paper"
import { Background, SearchInput } from "../../../components"
import { getAllComerces } from "../../../api/commerce.api"
import { useToast } from "../../../contexts/Toast.context.jsx"
import { CommerceCard } from "../../../components/shop/CommerceCard.jsx"
import { useAuth } from "../../../contexts/Auth.context.jsx"
import { useLayout } from "../../../layout/providers.layout.jsx"

export default () => {
  const [search, setSearch] = useState("")
  const [commerces, setCommerces] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const theme = useTheme()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { tabBarHeight } = useLayout()

  const fetchCommerces = useCallback(
    async ({ showErrorToast } = { showErrorToast: true }) => {
      try {
        const { data } = await getAllComerces()
        setCommerces(data.commerces)
      } catch (err) {
        console.log("Error fetching all commerces: ", err)
        if (!showErrorToast) return

        if (err?.message && typeof err.message === "string")
          showToast(err.message, "error")
        else showToast("Error al obtener los comercios", "error")
      }
    },
    [showToast]
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchCommerces({ showErrorToast: false })
    setRefreshing(false)
  }, [fetchCommerces])

  useEffect(() => {
    fetchCommerces()
  }, [fetchCommerces])

  const filteredCommerces = commerces.filter(
    (commerce) =>
      ["name", "description"].some((attr) => 
        commerce[attr]?.toLowerCase().includes(search.toLowerCase())
      )
  )

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Background background={theme.colors.onPrimary} />
      
      <SearchInput
        search={search}
        setSearch={setSearch}
        placeholder="Buscar comercio"
      />

      <FlatList
        data={filteredCommerces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CommerceCard commerce={item} userId={user?.id} />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {search
              ? "No se encontraron comercios"
              : "No hay comercios disponibles"}
          </Text>
        )}
        style={{ marginTop: 16, marginBottom: tabBarHeight }}
        contentContainerStyle={{ gap: 16 }}
      />
    </View>
  )
}

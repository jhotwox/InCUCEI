import { useEffect, useState } from "react"
import { FlatList, View } from "react-native"
import { Text, useTheme } from "react-native-paper"
import { Background, Input } from "../../../components"
import { getAllComerces } from "../../../api/commerce.api"
import { useSnackBar } from "../../../contexts/SnackBar.context"
import { CommerceCard } from "../../../components/shop/CommerceCard.jsx"
import { useAuth } from "../../../contexts/Auth.context.jsx"

export default () => {
  const [search, setSearch] = useState("")
  const [commerces, setCommerces] = useState([])

  const theme = useTheme()
  const { showSnack } = useSnackBar()
  const { user } = useAuth()

  useEffect(() => {
    const fetchCommerces = async () => {
      await getAllComerces()
        .then(({ data }) => {
          // console.log("All commerces data: ", data)
          setCommerces(data.commerces)
        })
        .catch((err) => {
          console.log("Error fetching all commerces: ", err)
          if (err?.message && typeof err.message === "string")
            showSnack(err.message, "error")
          else showSnack("Error al obtener los comercios", "error")
        })
    }

    fetchCommerces()
  }, [])

  const filteredCommerces = commerces.filter(
    (commerce) =>
      commerce.name.toLowerCase().includes(search.toLowerCase()) ||
      commerce.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Background background={theme.colors.onPrimary} />
      
      <Input
        placeholder="Buscar comercio"
        rightIcon="magnify"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredCommerces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CommerceCard commerce={item} userId={user?.id} />
        )}
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
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 16 }}
      />
    </View>
  )
}

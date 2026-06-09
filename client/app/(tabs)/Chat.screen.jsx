import { useEffect, useState } from "react"
import { View, FlatList, TouchableOpacity } from "react-native"
import { Text, Card, Searchbar } from "react-native-paper"
import { getUsersRequest } from "../../api/users.api"
import { router } from "expo-router"

export default function ChatsScreen() {

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await getUsersRequest()
      setUsers(res.data.users)
    } catch (error) {
      console.log("Error loading users", error)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  const renderUser = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          name: "Chat.screen",
          params: {
            chatUserId: item._id,
            chatUserEmail: item.email,
          },
        })
      }
    >
      <Card style={{ marginBottom: 10 }}>
        <Card.Content>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodySmall">{item.email}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1, padding: 16 }}>

      <Searchbar
        placeholder="Buscar alumno"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        style={{ marginTop: 16 }}
      />

    </View>
  )
}
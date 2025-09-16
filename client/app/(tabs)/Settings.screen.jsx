import { Button, Text, useTheme } from "react-native-paper"
import { Background } from "../../components"
import { useAuth } from "../../contexts/Auth.context"
import { View } from "react-native"
import { useEffect } from "react"

export default () => {
  // const [user, setUser] = useState(null)
  
  const theme = useTheme()
  const { profile, loading, error, logout, user } = useAuth()
  
  useEffect(() => {
    console.log("[+] Usr: ", user)
  }, [])
  
  const handlePress = () => {
    logout()
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Background />
      <Text>Hola {user?.email}</Text>
      <Button onPress={handlePress} icon="logout" mode="contained-tonal">Logout</Button>
    </View>
  )
}

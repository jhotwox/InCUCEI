import { Text } from "react-native-paper"
import { Background } from "../../../components"
import { View } from "react-native"

export default () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Background />
      <Text>Shop screen</Text>
    </View>
  )
}

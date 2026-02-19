import { Text } from "react-native-paper"
import { Background } from "../../components"
import { memo } from "react"
import { View } from "react-native"

const MapScreen = () => {
  return <>
    <Background />
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Map screen</Text>

    </View>
  </>
}

export default memo(MapScreen)
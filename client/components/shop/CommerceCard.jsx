import { router } from "expo-router"
import { View } from "react-native"
import { Card, Avatar, Button } from "react-native-paper"

export const CommerceCard = ({ commerce, userId }) => {
  if (!commerce) return null

  const handlePress = () => {
    // console.log("User ID", userId)

    // const otherUser =
    //   item.lastMessage.sender._id === user.id
    //     ? item.lastMessage.receiver
    //     : item.lastMessage.sender

    try {
      router.push({
        pathname: "/(tabs)/Sales.screen/Chat.screen",
        params: {
          commerceId: commerce.id,
          commerceName: commerce.name,
          commerceUserId: commerce.userId,
        },
      })
    } catch (err) {
      console.log("router Err: ", err)
    }
  }

  return (
    <View style={{ marginBottom: 8 }}>
      <Card>
        <Card.Title
          title={commerce.name}
          subtitle={commerce.description}
          left={(props) => (
            <Avatar.Image
              {...props}
              source={{ uri: commerce.logoUrl }}
              onError={() =>
                console.log("Error loading logo:", commerce.logoUrl)
              }
            />
          )}
        />
        {commerce.bannerUrl && (
          <Card.Cover
            source={{ uri: commerce.bannerUrl }}
            onError={() =>
              console.log("Error loading banner:", commerce.bannerUrl)
            }
          />
        )}
        <Card.Actions>
          <Button mode="contained" onPress={handlePress}>
            Contactar
          </Button>
        </Card.Actions>
      </Card>
    </View>
  )
}

import { router } from "expo-router"
import { View } from "react-native"
import { Card, Avatar, Button } from "react-native-paper"

/**
 * CommerceCard component.
 *
 * Renders a card UI for a commerce object with title, subtitle, optional logo and banner,
 * and a button to navigate to a chat screen for that commerce.
 *
 * Behavior:
 * - If `commerce` is falsy, the component returns null.
 * - The "Contactar" button calls an internal handler that navigates using expo-router.
 *   The handler pushes to the path "/(tabs)/Sales.screen/Chat.screen" with params:
 *     - commerceId: commerce.id
 *     - commerceName: commerce.name
 *     - commerceUserId: commerce.userId
 * - Avatar and Card.Cover include `onError` handlers that log URL load failures.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.commerce - Commerce data to display.
 * @param {string|number} props.commerce.id - Unique identifier for the commerce (used for navigation).
 * @param {string} props.commerce.name - Commerce display name (card title).
 * @param {string} [props.commerce.description] - Commerce description (card subtitle).
 * @param {string} [props.commerce.logoUrl] - URL for the commerce logo (Avatar.Image source).
 * @param {string} [props.commerce.bannerUrl] - URL for the commerce banner (Card.Cover source).
 * @param {string|number} [props.commerce.userId] - Owner/user id of the commerce (sent as commerceUserId param).
 * @param {string|number} [props.userId] - Current user id (optional, not used in render but available for logic).
 * @returns {import('react').JSX.Element|null} Rendered card element or null when `commerce` is not provided.
 */

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

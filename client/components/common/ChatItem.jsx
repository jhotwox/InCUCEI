import { Pressable, StyleSheet, View } from 'react-native'
import { memo } from 'react'
import { Avatar, Badge, Text } from 'react-native-paper'
import { BlurView } from "expo-blur"

// type: [commerce (for clientes tab), client (for mis chats tab)]
export default memo(({ item, onPress, theme, type }) => {
  const sender = item?.senderInfo
  const commerce = item?.commerceInfo
  const lastMessage = item?.lastMessage

  const title = type === "commerce"
    ? (sender?.name || "Usuario")
    : (commerce?.name || "Comercio")
  const subtitle = lastMessage?.content || ""
  let dateText = lastMessage?.createdAt
    ? new Date(lastMessage.createdAt).toLocaleString("es-MX")
    : ""
  
  const currentDate = new Date();
  if (lastMessage?.createdAt) {
    const messageDate = new Date(lastMessage.createdAt);
    
    // same day, show time
    if (currentDate.toDateString() === messageDate.toDateString()) {
      dateText = messageDate.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // not same day, show date
    else {
      dateText = messageDate.toLocaleDateString("es-MX");
    }
  }
  dateText = dateText || ""

  const unreadCount = item?.unreadCount || 0

  const styles = StyleSheet.create({
    itemPressable: {},
    itemSurface: {
      borderRadius: 16,
      padding: 12,
      backgroundColor: "rgba(255,255,255,0.85)",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    itemTextCol: {
      flex: 1,
      flexDirection: "row",
    },
    itemTitle: {},
    itemSubtitle: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
    },
    itemSubtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    itemDate: {
      color: theme.colors.onSurfaceVariant,
    },
    itemCommerce: {
      color: theme.colors.primary,
    },
    blurContainer: {
      overflow: "hidden",
      backgroundColor: "rgba(247, 255, 247, 0.7)",
      borderWidth: 2,
      borderColor: theme.colors.onSurface + "11",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
    },
    containerDate: {
      position: "absolute",
      top: 0,
      right: 0,
    }
  })

  const AvatarContent = () => {
    if (type === "commerce") {
      return sender?.profileUrl ? (
        <Avatar.Image size={44} source={{ uri: sender.profileUrl }} />
      ) : (
        <Avatar.Icon
          size={44}
          icon="account"
          style={{ backgroundColor: theme.colors.primaryContainer }}
          color={theme.colors.primary}
        />
      )
    } else {
      return commerce?.logoUrl ? (
        <Avatar.Image size={44} source={{ uri: commerce.logoUrl }} />
      ) : (
        <Avatar.Icon
          size={44}
          icon="store"
          style={{ backgroundColor: theme.colors.primaryContainer }}
          color={theme.colors.primary}
        />
      )
    }
  }

  return (
    <Pressable onPress={onPress} style={styles.itemPressable}>
      <BlurView style={styles.blurContainer} intensity={100}>
        <View style={[styles.itemRow, type === "client" && { padding: 8 }]}>
          <AvatarContent />

          <View style={styles.itemTextCol}>
            <View style={{ backgroundColor: "transparent", flex: 1 }}>
              <Text
                variant="titleMedium"
                numberOfLines={1}
                style={styles.itemTitle}
              >
                {title}
              </Text>
              <View style={[styles.itemSubtitleRow]}>
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={styles.itemSubtitle}
                >
                  {subtitle}
                </Text>
                {!!unreadCount && <Badge size={20} style={type === "commerce" && {position: "absolute", top: 0, right: 0, marginTop: 8 }}>{unreadCount}</Badge>}
              </View>
              
              {(!!commerce?.name && type === "commerce") && (
                <Text
                  variant="labelSmall"
                  numberOfLines={1}
                  style={styles.itemCommerce}
                >
                  {sender?.email}
                </Text>
              )}
            </View>
            <View style={styles.containerDate}>
              <Text
                variant="labelSmall"
                numberOfLines={1}
                style={styles.itemDate}
              >
                {dateText}
              </Text>
            </View>
          </View>
        </View>
      </BlurView>
    </Pressable>
  )
})


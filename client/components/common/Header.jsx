import { StyleSheet, View } from "react-native"
import { Avatar, IconButton, Text } from "react-native-paper"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { router } from "expo-router"

export default ({ title, subtitle, avatarUri = null, icon, theme, paddingTop = 8, leftButton = null }) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <BlurView intensity={20} tint="light" style={styles.blurHeader}>
        {/* // Ajusta el paddingTop para cambiar la altura del header */}
        <View style={[styles.headerContent, { paddingTop }]}>
          {leftButton && (
             <View>
              <IconButton
                icon={leftButton?.icon || "arrow-left"}
                size={24}
                onPress={leftButton?.onPress || (() => router.back())}
                iconColor={theme.colors.onPrimary}
              />
            </View>
          )}
          {avatarUri ? (
            <Avatar.Image
              size={40}
              source={{ uri: avatarUri }}
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
            />
          ) : (
            <Avatar.Icon
              size={40}
              icon={icon || "chat"}
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              color="#fff"
            />
          )}
          <View style={styles.headerTextContainer}>
            <Text variant="titleLarge" style={styles.headerTitle}>
              {title}
            </Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>
              {subtitle}
            </Text>
          </View>
        </View>
      </BlurView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {},
  blurHeader: {
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
})
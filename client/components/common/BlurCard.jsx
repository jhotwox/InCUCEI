import { BlurView } from "expo-blur"
import { StyleSheet } from "react-native"
import { useTheme } from "react-native-paper"

export default ({ styles, borderRadius = 16, children }) => {
  const theme = useTheme()

  return (
      <BlurView style={[
        style.container,
        {
          borderColor: theme.colors.onSurface + "33",
          borderRadius
        },
        styles]} intensity={50}>
        {children}
      </BlurView>
  )
}

const style = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 2,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
})

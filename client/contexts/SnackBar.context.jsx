import { createContext, useContext, useMemo, useState } from "react"
import { Snackbar, useTheme } from 'react-native-paper'

const SnackBarContext = createContext({ showSnack: () => {} })

export const SnackBarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [type, setType] = useState("info")
  const [duration, setDuration] = useState(2000)

  const theme = useTheme()

  const showSnack = (msg, type = "info", duration = 2000) => {
    setMessage(msg)
    setType(type)
    setVisible(true)
    setDuration(duration)
  }

  const snackBarStyle = useMemo(() => {
    if (type === "error")
      return { backgroundColor: theme.colors.error, color: theme.colors.onError }
    if (type === "success")
      return { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }
    if (type === "info")
      return { backgroundColor: theme.colors.tertiary, color: theme.colors.onTertiary }
    return { backgroundColor: "#333", color: "#fff" }
  }, [type, theme.colors])

  return (
    <SnackBarContext.Provider value={{ showSnack }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={duration}
        style={{ backgroundColor: snackBarStyle.backgroundColor }}
        theme={{ colors: { onSurface: snackBarStyle.color } }}
      >
        {message}
      </Snackbar>
    </SnackBarContext.Provider>
  )
}

export const useSnackBar = () => useContext(SnackBarContext)
import { createContext, useContext, useMemo, useState } from "react"
import { Snackbar, useTheme } from 'react-native-paper'

/**
 * ToastContext para manejo global de notificaciones tipo toast en la app InCUCEI.
 * Permite mostrar mensajes informativos, de éxito o error con estilos personalizados según el tema.
 *
 * @module ToastContext
 * @typedef {Object} ToastContextValue
 * @property {function(string, string=, number=): void} showToast - Muestra un toast con mensaje, tipo y duración.
 *
 * @example
 * import { useToast } from "../contexts/Toast.context"
 * const { showToast } = useToast()
 * showToast("Operación exitosa", "success", 3000)
 *
 * @see contexts/Toast.context.jsx
 * @see react-native-paper/Toast
 */

const ToastContext = createContext({ showToast: () => {} })

export const ToastProvider = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [type, setType] = useState("info")
  const [duration, setDuration] = useState(2000)

  const theme = useTheme()

  const showToast = (msg, type = "info", duration = 2000) => {
    setMessage(msg)
    setType(type)
    setVisible(true)
    setDuration(duration)
  }

  const toastStyle = useMemo(() => {
    if (type === "error")
      return { backgroundColor: theme.colors.error, color: theme.colors.onError }
    if (type === "success")
      return { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }
    if (type === "info")
      return { backgroundColor: theme.colors.tertiary, color: theme.colors.onTertiary }
    return { backgroundColor: "#333", color: "#fff" }
  }, [type, theme.colors])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={duration}
        style={{ backgroundColor: toastStyle.backgroundColor }}
        theme={{ colors: { onSurface: toastStyle.color } }}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
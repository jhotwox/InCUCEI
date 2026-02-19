import { createContext, useContext, useCallback, useState } from "react"
import { Portal } from "react-native-paper"
import { Toast } from "../components/Toast"

/**
 * ToastContext para manejo global de notificaciones tipo toast en la app InCUCEI.
 * Permite mostrar mensajes informativos, de éxito o error con estilos personalizados según el tema.
 *
 * @module ToastContext
 * @typedef {Object} ToastContextValue
 * @property {function(string, "success"|"error"|"info"=, number=): void} showToast
 *
 * @example
 * import { useToast } from "../contexts/Toast.context"
 * const { showToast } = useToast()
 * showToast("Operación exitosa", "success", 3000)
 */

const ToastContext = createContext({ showToast: () => {} })

export const ToastProvider = ({ children }) => {
  const [visible,  setVisible]  = useState(false)
  const [message,  setMessage]  = useState("")
  const [type,     setType]     = useState("info")
  const [duration, setDuration] = useState(2500)

  const showToast = useCallback((msg, toastType = "info", ms = 2500) => {
    setMessage(msg)
    setType(toastType)
    setDuration(ms)
    setVisible(true)
  }, [])

  const handleDismiss = useCallback(() => setVisible(false), [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal>
        <Toast
          visible={visible}
          message={message}
          type={type}
          duration={duration}
          onDismiss={handleDismiss}
        />
      </Portal>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
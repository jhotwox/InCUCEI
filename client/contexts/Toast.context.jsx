import { createContext, useContext, useCallback, useState } from "react"
import { Portal } from "react-native-paper"
import { Toast } from "../components/Toast"

/**
 * ToastContext para manejo global de notificaciones tipo toast en la app InCUCEI.
 * Permite mostrar mensajes informativos, de éxito o error con estilos personalizados según el tema.
 *
 * @module ToastContext
 * @typedef {Object} ToastContextValue
 * @property {function(string, "success"|"error"|"info"=, number=, function=): void} showToast
 *
 * @example
 * import { useToast } from "../contexts/Toast.context"
 * const { showToast } = useToast()
 * showToast("Operación exitosa", "success", 3000)
 */

const ToastContext = createContext({ showToast: () => {} })

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
    duration: 2500,
    onClick: null,
  })

  const showToast = useCallback((msg, toastType = "info", ms = 2500, onClick = null) => {
    setToast({
      visible: true,
      message: msg,
      type: toastType,
      duration: ms,
      onClick: onClick
    })
  }, [])

  const handleDismiss = useCallback(() => {
    setToast({ ...toast, visible: false })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={handleDismiss}
          onClick={toast.onClick}
        />
      </Portal>
    </ToastContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de notificaciones tipo toast.
 * @example
 * import { useToast } from "../contexts/Toast.context"
 * const { showToast } = useToast()
 * showToast("Operación exitosa", "success", 3000)
 * @returns {ToastContextValue} Función para mostrar notificaciones tipo toast.
 */
export const useToast = () => useContext(ToastContext)
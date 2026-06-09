import { createContext, useContext, useState, useEffect } from 'react'
import { useSharedValue, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated'
import { useAuth } from './Auth.context'
import { loadBackgroundAnimation, saveBackgroundAnimation } from '../utils/backgroundAnimationStorage'

const BackgroundAnimationContext = createContext(null)

export const BackgroundAnimationProvider = ({ children }) => {
  const offset = useSharedValue(0)
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true)
  const { user } = useAuth()

  // Cargar preferencia de animación del usuario al iniciar sesión
  useEffect(() => {
    if (user?.id) {
      loadBackgroundAnimation(user.id).then(val => {
        console.log("Animation value: ", val)
        if (val !== null) setIsAnimationEnabled(val)
      })
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      // Guardar preferencia de animación cada vez que cambie
      saveBackgroundAnimation(user.id, isAnimationEnabled)
    }
  }, [isAnimationEnabled])

  // Iniciar animación al montar el provider
  useEffect(() => {
    if (isAnimationEnabled) {
      // Iniciar animación
      offset.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    } else {
      // Detener animación y resetear a posición inicial
      cancelAnimation(offset)
      offset.value = withTiming(0, { duration: 300 })
    }
  }, [isAnimationEnabled])

  return (
    <BackgroundAnimationContext.Provider value={{ offset, isAnimationEnabled, setIsAnimationEnabled }}>
      {children}
    </BackgroundAnimationContext.Provider>
  )
}

export const useBackgroundAnimation = () => {
  const context = useContext(BackgroundAnimationContext)
  if (!context) {
    throw new Error('useBackgroundAnimation must be used within BackgroundAnimationProvider')
  }
  return context
}

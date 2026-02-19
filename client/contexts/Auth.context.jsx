import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ZodError } from "zod"
import { AxiosError } from "axios"
import { loginRequest, registerRequest, profileRequest, updateProfileRequest } from "../api/auth.api"
import { LoginValidator, RegisterValidator } from "../validators/auth.validator"
import { handleZodError } from "../handler/zod.handler"
import { handleAxiosError } from "../handler/axios.handler"
import { router } from "expo-router"

/**
 * @type {Object} user
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} profileUrl
 */

/**
 * @typedef {Object} error
 * @property {string} message
 * @property {string} path
 * @property {number} id
 */

/**
 * AuthContext para manejo de autenticación global en la app InCUCEI.
 * Provee estado y funciones para login, registro, perfil y logout.
 *
 * @module AuthContext
 * @typedef {Object} AuthContextValue
 * @property {string|null} token - JWT del usuario autenticado.
 * @property {Object|null} user - Datos del usuario autenticado.
 * @property {boolean} loading - Estado de carga de operaciones.
 * @property {Object|null} error - Último error ocurrido.
 * @property {function(Object): Promise<Object>} login - Inicia sesión con credenciales.
 * @property {function(Object): Promise<Object>} register - Registra usuario con credenciales.
 * @property {function(): Promise<Object>} profile - Obtiene perfil del usuario autenticado.
 * @property {function(): Promise<void>} logout - Cierra sesión y elimina token.
 *
 * @example
 * import { useAuth } from "../contexts/Auth.context"
 * const { login, register, user, token, logout } = useAuth()
 *
 * @see contexts/Auth.context.jsx
 * @see api/auth.api.js
 * @see validators/auth.validator.js
 * @see handler/zod.handler.js
 * @see handler/axios.handler.js
 */

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profileImageChanged, setProfileImageChanged] = useState(false)

  useEffect(() => {
    // Load token on app load
    loadToken()
  }, [])

  // useEffect(() => {
  //   // Load token on app load
  //   console.log("PIC status: ", profileImageChanged)
  // }, [profileImageChanged])

  // Protect routes
  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("Login.screen")
      } else {
        router.replace("Home.screen")
      }
    }
  }, [token])

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token")
      if (storedToken) {
        // Validate token by fetching profile
        const { data } = await profileRequest(storedToken)

        if (data?.id) {
          setUser(data)
          setToken(storedToken)
          router.replace("Home.screen")
          console.log("user Data: ", data)
          // console.log("token loaded")
        } else {
          // Token is invalid, remove it
          await AsyncStorage.removeItem("token")
          setToken(null)
          setUser(null)
          console.log("invalid token removed")
        }
      }
    } catch (err) {
      console.log("Error loading token:", err)
      const [message, path] = handleAxiosError(err)
      setError({message, path, id: Date.now()})
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const valid = LoginValidator.safeParse(credentials)

      if (!valid.success) throw valid.error

      if (!valid.data) throw "Datos inválidos"

      const response = await loginRequest(credentials)

      if (response?.data?.token) {
        const { token, user } = response.data

        await AsyncStorage.setItem("token", token)
        setToken(token)
        setUser(user)

        // router.replace("Home.screen")

        return response
      }
    } catch (err) {
      let message = "Error desconocido"
      let path = ""

      console.log("[-] Auth context login error: ", err)

      if (err instanceof ZodError) [message, path] = handleZodError(err)
      else if (err instanceof AxiosError) {
        console.log("is axios error")
        try {
          [message, path] = handleAxiosError(err)
        } catch (axiosErr) {
          console.log("[-] Error handling axios error: ", axiosErr)
        }
      } else if (typeof err === "string") {
        message = err
      } else if (Array.isArray(err)) {
        message = err.join(", ")
      } else if (err instanceof Error) {
        message = err.message
        path = err.stack
      }
      
      setError({ message, path, id: Date.now() })
      console.log("Error seteado")
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      // Add name to credentials
      // The name is before the . and the last name after the . and before the @
      let name = credentials.email.split("@")[0].split(".")[0]
      name = name.charAt(0).toUpperCase() + name.slice(1)
      let lastName =
        credentials.email.split("@")[0].split(".")[1].slice(0, -4) || ""
      lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)

      if (lastName) name += " " + lastName

      console.log("Name: ", name)
      const newCredentials = { ...credentials, name }
      const valid = RegisterValidator.safeParse(newCredentials)

      if (valid.error) throw valid.error

      if (!valid.data) throw "Error al validar los datos"

      const response = await registerRequest(newCredentials)

      if (response?.data?.token) {
        const { token, user } = response.data

        await AsyncStorage.setItem("token", token)
        setToken(token)
        setUser(user)
        
        return response
      }
    } catch (err) {
      let message = "Error desconocido"
      let path = ""

      console.log("[-] Auth context register error: ", err)

      if (err instanceof ZodError) [message, path] = handleZodError(err)
      else if (err instanceof AxiosError)
        [message, path] = handleAxiosError(err)
      else if (typeof err === "string") {
        message = err
      } else if (Array.isArray(err)) {
        message = err.join(", ")
      } else if (err instanceof Error) {
        message = err.message
        path = err.stack
      }

      setError({ message, path, id: Date.now() })
    } finally {
      setLoading(false)
    }
  }

  const profile = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) throw "No hay token disponible"

      const profile = await profileRequest(token)

      if (profile?.id) {
        // setUser(profile)
        return profile
      } else {
        throw "Error al obtener el perfil"
      }
    } catch (err) {
      let message = "Error desconocido"
      let path = ""

      console.log("[-] Auth context profile error: ", err)

      if (err instanceof ZodError) [message, path] = handleZodError(err)
      else if (err instanceof AxiosError)
        [message, path] = handleAxiosError(err)
      else if (typeof err === "string") {
        message = err
      } else if (Array.isArray(err)) {
        message = err.join(", ")
      } else if (err instanceof Error) {
        message = err.message
        path = err.stack
      }

      setError({ message, path, id: Date.now() })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await AsyncStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateUser = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await updateProfileRequest(userData)

      if (response?.data?.id) {
        setUser(response.data)
        
        // Update profileImageChanged
        setProfileImageChanged(true)

        return response
      } else {
        throw "Error al actualizar el perfil"
      }
    } catch (err) {
      let message = "Error desconocido"
      let path = ""

      console.log("[-] Auth context updateUser error: ", err)

      if (err instanceof ZodError) [message, path] = handleZodError(err)
      else if (err instanceof AxiosError)
        [message, path] = handleAxiosError(err)
      else if (typeof err === "string") {
        message = err
      } else if (Array.isArray(err)) {
        message = err.join(", ")
      } else if (err instanceof Error) {
        message = err.message
        path = err.stack
      }

      setError({ message, path, id: Date.now() })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        register,
        profile,
        logout,
        updateUser,
        profileImageChanged,
        setProfileImageChanged,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

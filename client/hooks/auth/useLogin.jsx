import { useCallback, useState } from "react"
import { ZodError } from "zod"
import { AxiosError } from "axios"
import { loginRequest } from '../../api/auth.api'
import { LoginValidator } from "../../validators/auth.validator"
import { handleZodError } from "../../handler/zod.handler"
import { handleAxiosError } from "../../handler/axios.handler"

export const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (user) => {
    try {
      console.log("1")
      setLoading(true)
      setError(null)
      
      console.log("2")
      const valid = LoginValidator.safeParse(user)
      
      console.log("3")
      if (!valid.success)
        throw valid.error
      
      console.log("4")
      if (!valid.data)
        throw "Datos inválidos"

      console.log("5")
      const { data } = await loginRequest(user)
      
      console.log("6")
      return data
    } catch (err) {
      let message = "Error desconocido"
      let path = ""

      console.log("7")
      if (err instanceof ZodError) [message, path] = handleZodError(err)
      else if (err instanceof AxiosError) [message, path] = handleAxiosError(err)
      else if (typeof err === "string") {
        message = err
      } else if (Array.isArray(err)) {
        message = err.join(", ")
      } else if (err instanceof Error) {
        message = err.message
        path = err.stack
      } 

      console.log("8")
      setError({ message, path, id: Date.now() })
    } finally {
      setLoading(false)
    }
  }, [])

  return { login, loading, error }
}
import { useCallback, useState } from "react"
import { ZodError } from "zod"
import { AxiosError } from "axios"

import { registerRequest } from '../../api/auth.api'
import { RegisterValidator } from "../../validators/auth.validator"
import { handleZodError } from "../../handler/zod.handler"
import { handleAxiosError } from "../../handler/axios.handler"


export const useRegister = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const register = useCallback(async (user) => {
    try {
      setLoading(true)
      setError(null)
      
      const valid = RegisterValidator.safeParse(user)
      
      if (valid.error)
        throw valid.error
      
      if (!valid.data)
        throw "Error al validar los datos"
      
      const { data } = await registerRequest({ email: valid.data.email, password: valid.data.password })
      console.log("data", data)
      return data
    } catch (err) {
      let message = "Error desconocido"
      let path = ""

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

      setError({ message, path, id: Date.now() })
    } finally {
      setLoading(false)
    }
  }, [])

  return { register, loading, error }
}
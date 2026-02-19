import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const instance = axios.create({ baseURL: `http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/api` })

instance.interceptors.request.use(
  async (config) => {
    // los CONSOLE.LOGS de este interceptor son para ver si se está inyectando el token correctamente en las peticiones de cambio de imagen (parecen hacer reaccionar mejor al interceptor, asi que NO BORRAR!)
    console.log("INTERCEPTOR START")
    const token = await AsyncStorage.getItem("token")

    if (token)
      config.headers.Authorization = `Bearer ${token}`

    console.log("TOKEN: ", token)
    return config
  },
  (error) => Promise.reject(error)
)

export default instance

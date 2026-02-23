import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const instance = axios.create({ baseURL: `http://${process.env.EXPO_PUBLIC_SERVER_IP}:3000/api` })

instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token")

    if (token)
      config.headers.Authorization = `Bearer ${token}`

    return config
  },
  (error) => Promise.reject(error)
)

export default instance

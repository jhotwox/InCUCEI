import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const instance = axios.create({ baseURL: `${process.env.EXPO_PUBLIC_SERVER_IP}/api` })

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

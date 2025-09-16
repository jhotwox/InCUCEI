import axios from "axios"
import { IP } from "../constants"
import AsyncStorage from "@react-native-async-storage/async-storage"

const instance = axios.create({ baseURL: `http://${IP}:3000/api` })

instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default instance

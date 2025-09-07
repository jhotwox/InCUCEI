import axios from 'axios'
import { IP } from '../constants'

export default instance = axios.create({
  baseURL: `http://${IP}:3000/api`,
  withCredentials: true,
})
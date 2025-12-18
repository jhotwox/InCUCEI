import { router } from 'expo-router'
import axios from '../api/axios'
import AsyncStorage from '@react-native-async-storage/async-storage'


export const loginRequest = async (user) => {
  return await axios
  .post('/login', user)
  .catch((err) => {
    console.log("[-] Login: ", err)
    console.log("[-] Login code: ", err.code)
    // console.log("[-] Login message: ", err.response.data.message)
    // if (err.response.data.message)
    //   throw err.response.data.message
    
    // if (err.response.data.err)
    //   throw err.response.data.err
    
    throw err
  })
}

export const registerRequest = async (user) => {
  return await axios
  .post('/register', user)
  .catch((err) => {
    console.log("[-] Register: ", err)
    if (err?.response?.data?.message)
      throw err?.response?.data?.message

    if (err.response.data.err)
      throw err.response.data.err
   
    throw err
  })
}

export const profileRequest = async (token) => {
  // console.log("Token: ", token)
  
  return await axios
  .post('/profile')
  .catch((err) => {
    console.log("[-] Profile error completo: ", err)
    console.log("[-] Status: ", err.response?.status)
    console.log("[-] Data: ", err.response?.data)
    console.log("[-] URL: ", err.config?.url)
    throw err
  })
}

export const logoutRequest = async () => {
  await AsyncStorage.removeItem('token').catch(err => console.error("AsyncStorage remove token: ", err))
  router.replace("Login.screen")
}

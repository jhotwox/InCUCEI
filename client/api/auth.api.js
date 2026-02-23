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

export const updatePictureRequest = async (formData, imageType) => {
  return axios
    .post(`/file/upload?imageType=${imageType}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    })
    .catch((err) => {
      console.log("[-] Upload image: ", err)
      console.log("[-] Upload image message: ", err?.message)
      // console.log("[-] Upload image repsonse message: ", err.response?.message)
      // console.log("[-] Upload image data: ", err.response?.data)
      throw err.response?.data || err
    })
}

export const updateProfileRequest = async (data) => {
  return await axios
  .patch('/profile', data)
  .catch((err) => {
    console.log("[-] Update profile error: ", err)
    console.log("[-] Status: ", err.response?.status)
    console.log("[-] Data: ", err.response?.data)
    throw err
  })
}

export const logoutRequest = async () => {
  await AsyncStorage.removeItem('token').catch(err => console.error("AsyncStorage remove token: ", err))
  router.replace("Login.screen")
}

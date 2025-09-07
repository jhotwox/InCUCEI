import axios from '../api/axios'

export const loginRequest = async (user) => {
  return await axios
  .post('/login', user)
  .catch((err) => {
    console.log("[-] Login: ", err)
    console.log("[-] Login message: ", err.response.data.message)
    if (err.response.data.message)
      throw err.response.data.message
    
    if (err.response.data.err)
      throw err.response.data.err
    
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

export const logoutRequest = async () => {
  return await axios
  .post('/logout')
  .catch((err) => {
    console.log("[-] Logout: ", err)
    console.log("[-] Logout message: ", err.response.data.message)
    return err.response.data.err
  })
}

export const profileRequest = async () => {
  return await axios
  .get('/profile')
  .catch((err) => {
    console.log("[-] Profile: ", err)
    console.log("[-] Profile message: ", err.response.data.message)
    return err.response.data.err
  })
}
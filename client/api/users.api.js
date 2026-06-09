import axios from "./axios"

export const getUsersRequest = async () => {
  return axios.get("/users").catch((err) => {
    console.log("[-] Get users: ", err)
    throw err
  })
}
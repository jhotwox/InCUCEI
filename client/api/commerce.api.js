import { updatePictureRequest } from "./auth.api"
import axios from "./axios"

export const getCommerce = async () => {
  return axios.get("/commerce").catch((err) => {
    console.log("[-] Get commerce: ", err)
    console.log("[-] commerce data: ", err.response?.data)
    throw err.response?.data || err
  })
}

export const getAllComerces = async () => {
  return axios.get("/commerces").catch((err) => {
    console.log("[-] Get all commerces: ", err)
    console.log("[-] All commerces data: ", err.response?.data)
    throw err.response?.data || err
  })
}

export const createCommerce = async (commerce) => {
  return axios.post("/commerce", commerce).catch((err) => {
    console.log("[-] Create commerce: ", err)
    console.log("[-] Create commerce data: ", err.response?.data)
    throw err.response?.data || err
  })
}

export const updateCommerce = async (commerce, id) => {
  console.log("1: ", id)

  return axios.patch(`/commerce/${id}`, commerce).catch((err) => {
    console.log("[-] Update commerce: ", err)
    console.log("[-] Update commerce data: ", err.response?.data?.err)
    throw err.response?.data?.err || err.response?.data || err
  })
}

export const uploadImage = async (file, imageType) => {
  // console.log("[+]imageType -> ", imageType)

  const formData = new FormData()

  formData.append("file", {
    uri: file.uri,
    type: file.mimeType,
    name: file.fileName,
  })

  console.log("Multipart: ", {uri: file.uri, mimeType: file.mimeType, fileName: file.fileName})

  return updatePictureRequest(formData, imageType)
}

export const deleteCommerce = async (id) => {
  return axios.delete(`/commerce/${id}`).catch((err) => {
    console.log("[-] Delete commerce: ", err)
    console.log("[-] Delete commerce data: ", err.response?.data)
    throw err.response?.data || err
  })
}

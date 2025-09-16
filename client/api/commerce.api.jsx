import axios from "../api/axios"

export const getCommerce = async () => {
  return axios.get("/commerce").catch((err) => {
    console.log("[-] Get commerce: ", err)
    console.log("[-] commerce data: ", err.response?.data)
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

  return axios
    .post(`/upload?imageType=${imageType}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    })
    .catch((err) => {
      console.log("[-] Upload image: ", err)
      console.log("[-] Upload image message: ", err?.message)
      console.log("[-] Upload image repsonse message: ", err.response?.message)
      console.log("[-] Upload image data: ", err.response?.data)
      throw err.response?.data || err
    })
}

export const deleteCommerce = async (id) => {
  return axios.delete(`/commerce/${id}`).catch((err) => {
    console.log("[-] Delete commerce: ", err)
    console.log("[-] Delete commerce data: ", err.response?.data)
    throw err.response?.data || err
  })
}

export const handleAxiosError = (err) => {
  console.log("[-] Axios error: ", err)
  console.log("[-] Axios error code: ", err.code)
  console.log("[-] Axios error message: ", err.message)
  console.log("[-] Axios error response: ", err.response)
  if (err.code === 'ERR_NETWORK')
    return ["Error de conexión", ""]
  if (err.message === "Network Error")
    return ["Error de conexión", ""]
  if (err.response?.data?.message) {
    console.log("Message: ", err.response.data.message)
    return [err.response.data.message, ""]
  }
  return [err.message, ""]
} 
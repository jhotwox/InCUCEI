export const handleAxiosError = (err) => {
  console.log("[-] Axios error: ", err)
  console.log("[-] Axios error message: ", err.message)
  console.log("[-] Axios error response: ", err.response)
  if (err.message === "Network Error")
    return ["Error de conexión", ""]
  return [err.message, ""]
} 
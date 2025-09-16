import axios from "../api/axios"

export const loadHistory = async () => {
  return await axios.get("/chatbot/history").catch((err) => {
    console.log("[-] Load Chat History: ", err)
    throw err
  })
}

export const deleteHistory = async () => {
  return await axios.delete("/chatbot/history").catch((err) => {
    console.log("[-] Delete Chat History: ", err)
    throw err
  })
}

export const sendMessage = async (message, type = "general") => {
  return await axios
    .post("/chatbot/message", { message, type })
    .catch((err) => {
      console.log("[-] Send Chat Message: ", err)
      throw err
    })
}

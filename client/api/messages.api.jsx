import axios from "../api/axios"

export const sendMessageRequest = async (
  commerceId,
  content,
  messageType = "text"
) => {
  return await axios
    .post("/messages/send", { commerceId, content, messageType })
    .catch((err) => {
      console.log("[-] Send Message: ", err)
      throw err
    })
}

export const getConversationRequest = async (commerceId) => {
  return await axios
    .get(`/messages/conversation/${commerceId}`)
    .catch((err) => {
      console.log("[-] Get Conversation: ", err)
      throw err
    })
}

export const getUserChatsRequest = async () => {
  return await axios.get("/messages/user-chats").catch((err) => {
    console.log("[-] Get User Chats: ", err)
    throw err
  })
}

export const markAsReadRequest = async (commerceId) => {
  return await axios.post(`/messages/read/${commerceId}`).catch((err) => {
    console.log("[-] Mark As Read: ", err)
    throw err
  })
}

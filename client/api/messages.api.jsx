import axios from "../api/axios"

export const sendMessageRequest = async (
  receiverId,
  content,
  messageType = "text"
) => {
  return await axios
    .post("/messages/send", { receiverId, content, messageType })
    .catch((err) => {
      console.log("[-] Send Message: ", err)
      throw err
    })
}

export const getConversationRequest = async (userId) => {
  return await axios
    .get(`/messages/conversation/${userId}`)
    .catch((err) => {
      console.log("[-] Get Conversation: ", err)
      throw err
    })
}

export const getUserChatsRequest = async () => {
  return await axios
    .get("/messages/chats")
    .catch((err) => {
      console.log("[-] Get User Chats: ", err)
      throw err
    })
}

export const markAsReadRequest = async (roomId) => {
  return await axios
    .post(`/messages/read/${roomId}`)
    .catch((err) => {
      console.log("[-] Mark As Read: ", err)
      throw err
    })
}
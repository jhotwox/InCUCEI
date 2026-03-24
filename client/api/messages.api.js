import axios from "./axios"

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

export const getCommerceChatsRequest = async () => {
  return await axios.get("/messages/commerce-chats").catch((err) => {
    console.log("[-] Get Commerce Chats: ", err)
    throw err
  })
}

export const getCommerceConversationRequest = async (commerceId, userId) => {
  return await axios
    .get(`/messages/commerce-conversation/${commerceId}/${userId}`)
    .catch((err) => {
      console.log("[-] Get Commerce Conversation: ", err)
      throw err
    })
}

export const sendCommerceMessageRequest = async (
  commerceId,
  userId,
  content,
  messageType = "text"
) => {
  return await axios
    .post("/messages/send-commerce", { commerceId, userId, content, messageType })
    .catch((err) => {
      console.log("[-] Send Commerce Message: ", err)
      throw err
    })
}

export const markAsReadRequest = async (commerceId) => {
  return await axios.put(`/messages/read/${commerceId}`).catch((err) => {
    console.log("[-] Mark As Read: ", err)
    throw err
  })
}

export const markCommerceAsReadRequest = async (commerceId, userId) => {
  return await axios
    .put(`/messages/commerce/read/${commerceId}/${userId}`)
    .catch((err) => {
      console.log("[-] Mark Commerce As Read: ", err)
      throw err
    })
}

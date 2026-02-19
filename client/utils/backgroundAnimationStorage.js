import AsyncStorage from '@react-native-async-storage/async-storage'

const getKey = (userId) => `backgroundAnimation_${userId}`

export const saveBackgroundAnimation = async (userId, value) => {
  try {
    await AsyncStorage.setItem(getKey(userId), JSON.stringify(value))
  } catch (e) {
    // Error
    throw new Error("Error saving background animation setting")
  }
}

export const loadBackgroundAnimation = async (userId) => {
  try {
    const val = await AsyncStorage.getItem(getKey(userId))
    return val !== null ? JSON.parse(val) : null
  } catch (e) {
    return null
  }
}

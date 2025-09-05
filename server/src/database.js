import mongoose from 'mongoose'
import { MONGOURI } from './config.js'

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGOURI)
    console.log(">>> DB is connected")
  } catch (err) {
    console.error("database: ", err)
  }
}
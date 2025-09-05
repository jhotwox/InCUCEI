import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://admin:admin123@localhost:27017", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("MongoDB conectado")
  } catch (err) {
    console.error(err)
  }
}

import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    roomId: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
)

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 })
messageSchema.index({ roomId: 1, createdAt: -1 })

export default mongoose.model("Message", messageSchema)

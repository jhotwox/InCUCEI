import mongoose from "mongoose"

const commerceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    logoUrl: {
      type: String,
      default: null,
    },
    logoPublicId: {
      type: String,
      default: null,
    },
    bannerUrl: {
      type: String,
      default: null,
    },
    bannerPublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// commerceSchema.index({ userId: 1 }, { unique: true })

export default mongoose.model("Commerce", commerceSchema)

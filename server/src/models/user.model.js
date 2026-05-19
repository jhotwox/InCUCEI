import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profileUrl: {
      type: String,
      default: null,
    },
    profilePublicId: {
      type: String,
      default: null,
    },
    career: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    // Allows uploading logo/banner before the commerce exists (mirrors old disk behavior).
    pendingLogoUrl: {
      type: String,
      default: null,
    },
    pendingLogoPublicId: {
      type: String,
      default: null,
    },
    pendingBannerUrl: {
      type: String,
      default: null,
    },
    pendingBannerPublicId: {
      type: String,
      default: null,
    },

    expoPushTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("User", userSchema)

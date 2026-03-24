import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"

let _configured = false

export const isCloudinaryEnabled = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

const _ensureConfigured = () => {
  if (_configured) return
  if (!isCloudinaryEnabled()) return

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  _configured = true
}

export const uploadImageBuffer = async ({
  buffer,
  folder,
  publicId,
  tags,
}) => {
  _ensureConfigured()
  if (!isCloudinaryEnabled()) {
    throw new Error("Cloudinary is not enabled")
  }
  if (!buffer) {
    throw new Error("Missing file buffer")
  }

  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        tags,
      },
      (error, result) => {
        if (error) return reject(error)
        return resolve(result)
      }
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export const destroyImage = async (publicId) => {
  _ensureConfigured()
  if (!isCloudinaryEnabled() || !publicId) return null
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    })
  } catch {
    return null
  }
}

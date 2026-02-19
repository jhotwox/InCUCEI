import fs from "fs"
import path from "path"

export const cleanExistingFiles = (req, res, next) => {
  const { imageType } = req.query
  const userId = req.user.id
  const baseFilename = `${imageType}_${userId}`
  const uploadDir = "uploads/"

  try {
    if (imageType === "logo" || imageType === "banner" || imageType === "profile") {
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir)

        files
          .filter((file) => file.startsWith(baseFilename + "."))
          .forEach((file) => {
            try {
              fs.unlinkSync(path.join(uploadDir, file))
              console.log(`Deleted file: ${file}`)
            } catch (err) {
              console.error(`Error deleting file ${file}:`, err)
            }
          })
      }
    } else {
      return res
        .status(400)
        .json({ message: "Tipo de imagen no válido", status: false })
    }
  } catch (err) {
    console.error("Error in cleanFiles middleware:", err)
  }

  next()
}

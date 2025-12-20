import fs from "fs/promises"
import path from "path"

export const cleanExistingFiles = async (req, res, next) => {
  const { imageType } = req.query
  const userId = req.user.id
  const baseFilename = `${imageType}_${userId}`
  const uploadDir = "uploads/"

  try {
    if (imageType === "logo" || imageType === "banner") {
      try {
        // Check if directory exists
        await fs.access(uploadDir)
        const files = await fs.readdir(uploadDir)

        // Delete matching files in parallel
        const deletePromises = files
          .filter((file) => file.startsWith(baseFilename + "."))
          .map(async (file) => {
            try {
              await fs.unlink(path.join(uploadDir, file))
              console.log(`Deleted file: ${file}`)
            } catch (err) {
              console.error(`Error deleting file ${file}:`, err)
            }
          })
        
        await Promise.all(deletePromises)
      } catch (err) {
        // Directory doesn't exist or other error, continue
        if (err.code !== 'ENOENT') {
          console.error("Error accessing upload directory:", err)
        }
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

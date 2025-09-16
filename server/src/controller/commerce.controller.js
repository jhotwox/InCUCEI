import Commerce from "../models/commerce.model.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to find file by pattern
const findFileByPattern = (pattern) => {
  try {
    const uploadsDir = path.join(__dirname, "../../uploads")
    const files = fs.readdirSync(uploadsDir)
    return files.find((file) => file.startsWith(pattern))
  } catch (err) {
    console.error("Error buscando archivo:", err)
    return null
  }
}

// Helper function to construct image URLs
const getImageUrls = (userId, req) => {
  const logoFile = findFileByPattern(`logo_${userId}.`)
  const bannerFile = findFileByPattern(`banner_${userId}.`)

  const baseUrl = `${req.protocol}://${req.get("host")}/uploads`

  return {
    logoUrl: logoFile ? `${baseUrl}/${logoFile}` : null,
    bannerUrl: bannerFile ? `${baseUrl}/${bannerFile}` : null,
  }
}

export const createCommerce = async (req, res) => {
  const { name, description } = req.body
  const userId = req.user.id
  console.log(name, description, userId)

  try {
    const newCommerce = new Commerce({
      name,
      description,
      userId,
    })
    const commerce = await newCommerce.save()

    const { logoUrl, bannerUrl } = getImageUrls(userId, req)

    return res.json({
      commerce: {
        id: commerce._id,
        name: commerce.name,
        description: commerce.description,
        userId: commerce.userId,
        logoUrl,
        bannerUrl,
        createdAt: commerce.createdAt,
        updatedAt: commerce.updatedAt,
      },
      status: true,
    })
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({
        message: "Este usuario ya registro un comercio",
        status: false,
      })

    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message, status: false })

    return res
      .status(500)
      .json({ message: "Error en el servidor", status: false })
  }
}

export const updateCommerce = async (req, res) => {
  const commerce = req.body
  console.log(commerce.name, commerce.description)

  try {
    const commerceUpdated = await Commerce.findByIdAndUpdate(
      req.params.id,
      {
        $set: commerce,
      },
      { new: true, runValidators: true }
    )
    if (!commerceUpdated)
      return res
        .status(400)
        .json({ message: "Comercio no encontrado", status: false })

    const { logoUrl, bannerUrl } = getImageUrls(commerceUpdated.userId, req)

    return res.json({
      message: "Comercio actualizado",
      commerce: {
        ...commerceUpdated,
        logoUrl,
        bannerUrl,
      },
      status: true,
    })
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message, status: false })

    return res
      .status(500)
      .json({ message: "Error en el servidor", status: false })
  }
}

export const deleteCommerce = async (req, res) => {
  try {
    const commerceDeleted = await Commerce.findByIdAndDelete(req.params.id)
    if (!commerceDeleted)
      return res
        .status(400)
        .json({ message: "Comercio no encontrado", status: false })

    return res.json({
      message: "Comercio eliminado",
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const getCommerceByUserId = async (req, res) => {
  try {
    const commerceFound = await Commerce.findOne({ userId: req.user.id })
    if (!commerceFound)
      return res
        .status(400)
        .json({ message: "Comercio no encontrado", status: false })

    const { logoUrl, bannerUrl } = getImageUrls(req.user.id, req)

    return res.json({
      commerce: {
        id: commerceFound._id,
        name: commerceFound.name,
        description: commerceFound.description,
        userId: commerceFound.userId,
        logoUrl,
        bannerUrl,
        createdAt: commerceFound.createdAt,
        updatedAt: commerceFound.updatedAt,
      },
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const getAllCommerce = async (req, res) => {
  try {
    const commerces = await Commerce.find()
    if (!commerces)
      return res
        .status(400)
        .json({ message: "Comercios no encontrados", status: false })

    const commercesWithImages = commerces.map((commerce) => {
      const { logoUrl, bannerUrl } = getImageUrls(commerce.userId, req)
      return {
        id: commerce._id,
        name: commerce.name,
        description: commerce.description,
        userId: commerce.userId,
        logoUrl,
        bannerUrl,
        createdAt: commerce.createdAt,
        updatedAt: commerce.updatedAt,
      }
    })

    return res.json({
      commercesWithImages,
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

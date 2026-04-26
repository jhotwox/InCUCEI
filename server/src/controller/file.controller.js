import { subjectsData } from "../data/subjects.data.js"
import { getStudyPlan, getAllSubjects, getCurriculumByCareer } from "../services/subjects.service.js"
import { romanToArabic, IDontLikeTildesAnymore } from "../libs/string.utils.js"
import User from "../models/user.model.js"
import Commerce from "../models/commerce.model.js"
import { isCloudinaryEnabled, uploadImageBuffer } from "../services/cloudinary.service.js"

export const getCurriculum = async (req, res) => {
  const { career } = req.params

  try {
    console.log("Career: ", career)
    const response = getCurriculumByCareer(career)
    return res.json({ data: response, status: true })
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Error interno del servidor", status: false })
  }
}

export const getPlan = async (req, res) => {
  const { subject } = req.params
  let formattedSubject = subject.toLowerCase()
  
  try {
    // Format subject
    formattedSubject = romanToArabic(formattedSubject)
    formattedSubject = IDontLikeTildesAnymore(formattedSubject)

    // Get study plan
    const response = getStudyPlan(formattedSubject)
    return res.json(response)
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Error interno del servidor", status: false })
  }
}

export const getSubjects = async (req, res) => {
  const subjects = getAllSubjects()

  return res.json({ data: subjects, status: true })
}

// Not used currently
export const getSubjectsByCarrer = async (req, res) => {
  const career = req.params.career.toUpperCase()
  if (!subjectsData[career]) {
    return res
      .status(404)
      .json({ message: "Carrera no encontrada", status: false })
  }

  const subjects = Object.entries(subjectsData[career]).map(
    ([key, subject]) => ({
      key,
      names: subject.names,
      code: subject.code,
    })
  )

  return res.json({ data: subjects, status: true })
}

export const uploadFile = async (req, res) => {
  const { imageType } = req.query
  const userId = req.user?.id

  if (!imageType || typeof imageType !== "string") {
    return res
      .status(400)
      .json({ message: "Tipo de imagen no válido", status: false })
  }

  const allowed = new Set(["profile", "logo", "banner"])
  if (!allowed.has(imageType)) {
    return res
      .status(400)
      .json({ message: "Tipo de imagen no válido", status: false })
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No se ha subido ningún archivo", status: false })
  }

  if (req.file.mimetype && !String(req.file.mimetype).startsWith("image/")) {
    return res
      .status(400)
      .json({ message: "Solo se permiten imágenes", status: false })
  }

  if (!isCloudinaryEnabled()) {
    return res.status(500).json({
      message:
        "Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.",
      status: false,
    })
  }

  if (!userId) {
    return res.status(401).json({ message: "No autorizado", status: false })
  }

  if (!req.file.buffer) {
    return res
      .status(400)
      .json({ message: "Archivo inválido", status: false })
  }

  try {
    // Keep same naming convention as before: <purpose>_<ownerId>
    // profile_<userId>, logo_<userId>, banner_<userId>
    const cloudRes = await uploadImageBuffer({
      buffer: req.file.buffer,
      folder: "incucei",
      publicId: `${imageType}_${userId}`,
      tags: ["incucei", imageType, String(userId)],
    })

    const url = cloudRes?.secure_url
    const publicId = cloudRes?.public_id

    if (!url) {
      return res.status(500).json({ message: "Error subiendo imagen", status: false })
    }

    if (imageType === "profile") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { profileUrl: url, profilePublicId: publicId ?? null } },
        { new: false }
      )
    }

    if (imageType === "logo" || imageType === "banner") {
      const commerce = await Commerce.findOne({ userId })

      if (commerce) {
        if (imageType === "logo") {
          commerce.logoUrl = url
          commerce.logoPublicId = publicId ?? commerce.logoPublicId
        } else {
          commerce.bannerUrl = url
          commerce.bannerPublicId = publicId ?? commerce.bannerPublicId
        }
        await commerce.save()
      } else {
        // Allow upload before commerce exists.
        const set =
          imageType === "logo"
            ? { pendingLogoUrl: url, pendingLogoPublicId: publicId ?? null }
            : { pendingBannerUrl: url, pendingBannerPublicId: publicId ?? null }
        await User.findByIdAndUpdate(userId, { $set: set }, { new: false })
      }
    }

    return res.status(201).json({
      message: "Archivo subido correctamente",
      file: {
        path: url,
        publicId,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      },
      status: true,
    })
  } catch (error) {
    console.error("[-] Cloudinary upload error:", error)
    return res.status(500).json({ message: "Error subiendo imagen", status: false })
  }
}

export const ping = async (req, res) =>
  await res.status(200).json({ message: "Servidor vivo!", status: true })

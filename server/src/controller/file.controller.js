import { subjectsData } from "../data/subjects.data.js"
import { getStudyPlan, getAllSubjects } from "../services/subjects.service.js"
import { romanToArabic, IDontLikeTildesAnymore } from "../libs/string.utils.js"

export const getPlan = async (req, res) => {
  const { subject } = req.params
  let fomattedSubject = subject.toLowerCase()
  
  try {
    // Format subject
    fomattedSubject = romanToArabic(fomattedSubject)
    fomattedSubject = IDontLikeTildesAnymore(fomattedSubject)

    // Get study plan
    const response = getStudyPlan(fomattedSubject)
    return res.json(response)
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error interno del servidor", status: false })
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
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No se ha subido ningún archivo", status: false })
  }

  // const fileUrl = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`

  return res.status(201).json({
    message: "Archivo subido correctamente",
    file: req.file,
    status: true,
  })
}

export const ping = async (req, res) =>
  await res.status(200).json({ message: "Servidor vivo!", status: true })

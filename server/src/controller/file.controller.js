import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { studyPlanData } from "../data/study_plan.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getPlan = async (req, res) => {
  const { subject } = req.params

  const subjectData = studyPlanData.subjects[subject.toLowerCase()]

  if (!subjectData) {
    return res
      .status(404)
      .json({ message: "Materia no encontrada", status: false })
  }

  const filePath = path.join(__dirname, "../files/study_plan", subjectData.file)

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ message: "Archivo no encontrado", status: false })
  }

  const host = process.env.HOST || "localhost"
  const port = process.env.PORT || "3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"

  const serverUrl = `${protocol}://${host}:${port}/files/study_plan/${subjectData.file}`
  console.log("Server URL:", serverUrl)
  console.log("full host:", host + ":" + port)

  return res.json({
    data: {
      subject: subjectData.name,
      code: subjectData.code,
      file: subjectData.file,
      path: serverUrl,
    },
    status: true,
  })
}

export const getSubjects = async (req, res) => {
  const subjects = Object.entries(studyPlanData.subjects).map(
    ([key, subject]) => ({
      key,
      name: subject.name,
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

export const ping = async (req, res) => {
  return await res.status(200).json({ message: "Servidor vivo!", status: true })
}

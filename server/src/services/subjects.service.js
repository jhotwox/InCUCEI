import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { subjectsData } from "../data/subjects.data.js"

import {
  getAllSubjects,
  getSubjectByName,
  resolveSubject,
} from "./subjects.search.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export { getAllSubjects, getSubjectByName, resolveSubject }

export const getCurriculumByName = (career) => {
  const formattedCareer = career.toUpperCase()
  const filePath = path.join(__dirname, "../files/Mallas", `${formattedCareer}.pdf`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  return {
    career: formattedCareer,
    file: `${formattedCareer}.pdf`,
  }
}

export const getCurriculumByCareer = (career) => {
  const formattedCareer = career.toUpperCase()
  const fileName = getCurriculumByName(formattedCareer)?.file
  
  if (!fileName) {
    throw new Error("Carrera no encontrada", 404)
    // return {
    //   message: "Carrera no encontrada",
    //   status: false
    // }
  }

  const host = process.env.HOST || "localhost"
  const port = process.env.PORT || "3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"

  const serverUrl = `${protocol}://${host}${process.env.NODE_ENV === "development" ? `:${port}` : ""}/files/Mallas/${fileName}`

  return {
    data: {
      career: formattedCareer,
      file: fileName,
      path: serverUrl
    },
    status: true
  }
}

export const getStudyPlan = (subject, career = null) => {
  let subjectData = null
  const raw = String(subject || "")
  const formattedCareer = career ? String(career).toUpperCase() : null
  const candidateKey = raw.toLowerCase()
  
  if (formattedCareer && subjectsData[formattedCareer]?.[candidateKey]) {
    subjectData = subjectsData[formattedCareer][candidateKey]
  } else {
    const resolved = resolveSubject(raw, { career: formattedCareer, limit: 1 })
    const best = resolved[0]?.item
    if (best && subjectsData[best.career]?.[best.key]) {
      subjectData = subjectsData[best.career][best.key]
    }
  }

  if (!subjectData)
    throw new Error("Materia no encontrada", 404)

  const filePath = path.join(__dirname, "../files/study_plan",subjectData.career, subjectData.files.study_plan)  

  if (!fs.existsSync(filePath))
    throw new Error("Archivo no encontrado", 404)

  const host = process.env.HOST || "localhost"
  const port = process.env.PORT || "3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"

  const serverUrl = `${protocol}://${host}${process.env.NODE_ENV === "development" ? `:${port}` : ""}/files/study_plan/${subjectData.career}/${subjectData.files.study_plan}`
  // console.log("Server URL:", serverUrl)
  // console.log("full host:", host + ":" + port)

  return {
    data: {
      subject: subjectData.name,
      code: subjectData.code,
      file: subjectData.files.study_plan,
      path: serverUrl,
    },
    status: true,
  }
}

export const getMaterial = (subject, career = null) => {
  let subjectData = null
  const raw = String(subject || "")
  const formattedCareer = career ? String(career).toUpperCase() : null
  const candidateKey = raw.toLowerCase()

  if (formattedCareer && subjectsData[formattedCareer]?.[candidateKey]) {
    subjectData = subjectsData[formattedCareer][candidateKey]
  } else {
    const resolved = resolveSubject(raw, { career: formattedCareer, limit: 1 })
    const best = resolved[0]?.item
    if (best && subjectsData[best.career]?.[best.key]) {
      subjectData = subjectsData[best.career][best.key]
    }
  }

  if (!subjectData)
    throw new Error("Material no encontrado", 404)

  const filePath = path.join(__dirname, '../files/material/', subjectData.career, subjectData.files.material);

  if (!fs.existsSync(filePath))
    throw new Error("Archivo no encontrado", 404);

  const host = process.env.HOST || "localhost"
  const port = process.env.PORT || "3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"  

  const serverUrl = `${protocol}://${host}${process.env.NODE_ENV === "development" ? `:${port}` : ""}/files/material/${subjectData.career}/${subjectData.files.material}`;

  return {
    data: {
      subject: subjectData.name,
      code: subjectData.code,
      file: subjectData.files.material,
      path: serverUrl,
    },
    status: true,
  }
}
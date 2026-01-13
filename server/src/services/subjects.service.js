import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { subjectsData } from "../data/subjects.data.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getAllSubjects = () => {
  const subjects = Object.entries(subjectsData).flatMap(
    ([_, career]) => Object.entries(career).map(
      ([key, subject]) => ({
        key,
        names: subject.names,
        code: subject.code,
        career: subject.career
      })
    )
  )

  return subjects
}

export const getSubjectByName = (name) => {
  const formattedName = name.toLowerCase()
  for (const careerKey in subjectsData) {
    const career = subjectsData[careerKey]
    for (const subjectKey in career) {
      const subject = career[subjectKey]
      if (subject.names.some(n => n.toLowerCase() === formattedName)) {
        return {
          key: subjectKey,
          // names: subject.names,
          code: subject.code,
          career: subject.career
        }
      }
    }
  }
  return null
}

console.log("Res: ", getSubjectByName("Admin base datos"))
 // For testing

export const getStudyPlan = (subject, career = null) => {
  let subjectData = null
  
  if (career) {
    subjectData = subjectsData[career][subject.toLowerCase()]
  } else {
    // Search in all careers
    const foundSubject = getAllSubjects().find((subj) => subj.key === subject.toLowerCase())
    
    if (foundSubject)
      subjectData = subjectsData[foundSubject.career][subject.toLowerCase()]
  }
  
  if (!subjectData)
    throw new Error("Materia no encontrada", 404)

  // console.log("Final Subject: ", subjectData)

  const filePath = path.join(__dirname, "../files/study_plan", subjectData.files.study_plan)

  if (!fs.existsSync(filePath))    
    throw new Error("Archivo no encontrado", 404)

  const host = process.env.HOST || "localhost"
  const port = process.env.PORT || "3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"

  const serverUrl = `${protocol}://${host}:${port}/files/study_plan/${subjectData.files.study_plan}`
  // console.log("Server URL:", serverUrl)
  // console.log("full host:", host + ":" + port)

  return {
    data: {
      subject: subjectData.names ? subjectData.names[0] : subjectData.name,
      code: subjectData.code,
      file: subjectData.files.study_plan,
      path: serverUrl,
    },
    status: true,
  }
}

import { getStudyPlan, getSubjectByName } from '../subjects.service.js'
import { formatSubjectName } from "../../libs/string.utils.js"
import { ERROR_MESSAGES } from './gemini.config.js'

// ============ Function Handlers ============

/**
 * Handler para obtener material de estudio de una materia
 */
export function handleGetSubjectMaterial(subject) {
  const result = `El material de estudio para la materia ${subject} está disponible en la plataforma educativa de CUCEI.`
  console.log(`[+] Subject Material Info: ${result}`)
  return result
}

/**
 * Handler para obtener el plan de estudios de una materia
 */
export function handleGetSubjectStudyPlan(subject) {
  try {
    const formattedSubject = formatSubjectName(subject)
    const foundSubject = getSubjectByName(formattedSubject)

    if (!foundSubject) {
      console.log(`[!] Subject not found: ${subject}`)
      return ERROR_MESSAGES.subjectNotFound(subject)
    }

    console.log(`[+] Found Subject: ${JSON.stringify(foundSubject)}`)
    const studyPlanResponse = getStudyPlan(foundSubject.key, foundSubject.career)
    
    const result = JSON.stringify({
      subject: studyPlanResponse.data.subject,
      code: studyPlanResponse.data.code,
      file: studyPlanResponse.data.file,
      path: studyPlanResponse.data.path
    })
    
    console.log(`[+] Study Plan Result: ${result}`)
    return result
    
  } catch (error) {
    console.error("Error fetching study plan: ", error)
    return ERROR_MESSAGES.studyPlanError(subject)
  }
}

/**
 * Ejecuta la función solicitada por el modelo
 */
export async function executeFunctionCall(functionCall) {
  console.log(`[+] Function to call: ${functionCall.name}`)
  console.log(`[+] Arguments: ${JSON.stringify(functionCall.args)}`)
  
  const { name, args } = functionCall
  
  switch (name) {
    case "get_subject_material":
      return handleGetSubjectMaterial(args.subject)
    
    case "get_subject_study_plan":
      return handleGetSubjectStudyPlan(args.subject)
    
    default:
      console.warn(`[!] Unknown function: ${name}`)
      return ERROR_MESSAGES.unknownFunction(name)
  }
}

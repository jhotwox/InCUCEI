import { getCurriculumByCareer, getCurriculumByName, getMaterial, getStudyPlan, getSubjectByName } from '../subjects.service.js'
import { formatSubjectName } from "../../libs/string.utils.js"
import { ERROR_MESSAGES, isKnownCareerCode } from './gemini.config.js'
import { PLACES } from '../../constants/places.js'

// ============ Function Handlers ============

/**
 * Handler para obtener material de estudio de una materia
 */
export function handleGetSubjectMaterial(subject, career = null) {
  try {
    const careerKey = career ? String(career).toUpperCase().trim() : null
    if (!careerKey) {
      return JSON.stringify({
        error: "missing_career_code",
        message:
          "Para buscar material necesito el código de tu carrera (por ejemplo: INNI, INEA, LQFB, INFO, ILOT, LILT). ¿Cuál es el tuyo?",
      })
    }

    if (!isKnownCareerCode(careerKey)) {
      return JSON.stringify({
        error: "invalid_career_code",
        message: ERROR_MESSAGES.careerNotFound(careerKey),
      })
    }

    const formattedSubject = formatSubjectName(subject)
    const foundSubject = getSubjectByName(formattedSubject, careerKey)

    if (!foundSubject) {
      console.log(`[!] Subject not found: ${subject}`)
      return ERROR_MESSAGES.subjectNotFound(subject)
    }

    console.log(`[+] Found Subject: ${JSON.stringify(foundSubject)}`)
    const materialResponse = getMaterial(foundSubject.key, careerKey)
    
    const result = JSON.stringify({
      subject: materialResponse.data.subject,
      code: materialResponse.data.code,
      file: materialResponse.data.file,
      path: materialResponse.data.path
    })
    
    console.log(`[+] Material Result: ${result}`)
    return result
  } catch (error) {
    console.error("Error fetching material: ", error)
    return ERROR_MESSAGES.materialError(subject)
  }
}

/**
 * Handler para obtener el plan de estudios de una materia
 */
export function handleGetSubjectStudyPlan(subject, career = null) {
  try {
    const careerKey = career ? String(career).toUpperCase().trim() : null
    if (!careerKey) {
      return JSON.stringify({
        error: "missing_career_code",
        message:
          "Para buscar el plan de estudios necesito el código de tu carrera (por ejemplo: INNI, INEA, LQFB, INFO, ILOT, LILT). ¿Cuál es el tuyo?",
      })
    }

    if (!isKnownCareerCode(careerKey)) {
      return JSON.stringify({
        error: "invalid_career_code",
        message: ERROR_MESSAGES.careerNotFound(careerKey),
      })
    }

    const formattedSubject = formatSubjectName(subject)
    const foundSubject = getSubjectByName(formattedSubject, careerKey)

    if (!foundSubject) {
      console.log(`[!] Subject not found: ${subject}`)
      return ERROR_MESSAGES.subjectNotFound(subject)
    }

    console.log(`[+] Found Subject: ${JSON.stringify(foundSubject)}`)
    const studyPlanResponse = getStudyPlan(foundSubject.key, careerKey)

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
 * Handler para obtener la malla curricular de una carrera
 */
export function handleGetCurriculum(career) {
  try {
    const formattedCareer = career.toUpperCase()
    const foundCareer = getCurriculumByName(formattedCareer)

    if (!foundCareer) {
      console.log(`[!] Career not found: ${career}`)
      return ERROR_MESSAGES.careerNotFound(career)
    }

    console.log(`[+] Found Career: ${JSON.stringify(foundCareer)}`)
    const curriculumResponse = getCurriculumByCareer(formattedCareer)

    const result = JSON.stringify({
      career: curriculumResponse.data.career,
      file: curriculumResponse.data.file,
      path: curriculumResponse.data.path
    })

    console.log(`[+] Curriculum Result: ${result}`)
    return result

  } catch (error) {
    console.error("Error fetching curriculum: ", error)
    return ERROR_MESSAGES.careerNotFound(career)
  }
}

/**
 * Handler para mostrar ubicación en el mapa
 */
export function handleShowLocationOnMap(locationName) {
  try {
    console.log(`[+] Searching for location: ${locationName}`)

    // Buscar lugar que coincida con el nombre o alias (búsqueda flexible)
    const place = PLACES.find(p => {
      const locationLower = locationName.toLowerCase();
      const nameLower = p.name.toLowerCase();
      const nameMatch = nameLower.includes(locationLower) || locationLower.includes(nameLower);
      const aliasMatch = p.alias?.some(a => a.toLowerCase().includes(locationLower));

      return nameMatch || aliasMatch;
    });

    if (!place) {
      console.log(`[!] Location not found: ${locationName}`)
      return JSON.stringify({
        success: false,
        message: `No encontré el lugar "${locationName}" en el mapa del campus. ¿Podrías darme más detalles o verificar el nombre?`
      })
    }

    console.log(`[+] Found location: ${place.name} at [${place.coord}]`)

    // Retornar acción especial para navegación
    return JSON.stringify({
      success: true,
      action: "navigate_to_map",
      placeId: place.id,
      placeName: place.name,
      placeType: place.type,
      coordinates: place.coord,
      message: `Perfecto, te estoy mostrando ${place.name} en el mapa 📍`
    })

  } catch (error) {
    console.error("Error showing location on map: ", error)
    return JSON.stringify({
      success: false,
      message: "Hubo un error al buscar la ubicación. Intenta de nuevo."
    })
  }
}

/**
 * Handler para buscar un tema en Google Scholar
 */
export function handleSearchScholarTopic(topic) {
  try {
    console.log(`[+] Searching for topic on Google Scholar: ${topic}`)

    if (!topic || String(topic).trim() === "") {
      return JSON.stringify({
        success: false,
        message: "Por favor, dime qué tema te gustaría buscar en Google Scholar."
      })
    }

    const encodedTopic = encodeURIComponent(topic)
    const scholarUrl = `https://scholar.google.com/scholar?q=${encodedTopic}`

    return JSON.stringify({
      success: true,
      action: "open_url",
      url: scholarUrl,
      topic: topic,
      message: `Aquí tienes una búsqueda en Google Scholar sobre "${topic}".`
    })
  } catch (error) {
    console.error("Error creating Google Scholar link: ", error)
    return JSON.stringify({
      success: false,
      message: "Hubo un error al generar el enlace de búsqueda. Intenta de nuevo."
    })
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
      return handleGetSubjectMaterial(args.subject, args.career)

    case "get_subject_study_plan":
      return handleGetSubjectStudyPlan(args.subject, args.career)

    case "get_curriculum":
      return handleGetCurriculum(args.career)

    case "show_location_on_map":
      return handleShowLocationOnMap(args.locationName)

    case "search_scholar_topic":
      return handleSearchScholarTopic(args.topic)

    default:
      console.warn(`[!] Unknown function: ${name}`)
      return ERROR_MESSAGES.unknownFunction(name)
  }
}

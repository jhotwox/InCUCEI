import { getCurriculumByCareer, getCurriculumByName, getMaterial, getStudyPlan, getSubjectByName } from '../subjects.service.js'
import { formatSubjectName } from "../../libs/string.utils.js"
import { CONTACT_RESOURCES, ERROR_MESSAGES, isKnownCareerCode } from './gemini.config.js'
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

const _normalize = (value) => {
  const raw = String(value ?? "")
  return raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const _CONTACT_STOPWORDS = new Set(
  [
    "de",
    "la",
    "el",
    "los",
    "las",
    "y",
    "e",
    "en",
    "a",
    "al",
    "del",
    "para",
    "por",
    "con",
    "que",
    "una",
    "un",
    "unos",
    "unas",
    "porfavor",
    "por",
    "favor",
    "dame",
    "dime",
    "pasame",
    "pasa",
    "me",
    "das",
    "pasas",
    "quiero",
    "necesito",
    "puedes",
    "podrias",
    "contacto",
    "contactar",
    "comunicarme",
    "telefono",
    "correo",
    "email",
    "ext",
  ].map(String)
)

const _tokenSet = (value) => {
  const tokens = _normalize(value)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !_CONTACT_STOPWORDS.has(t))
  return new Set(tokens)
}

const _jaccard = (a, b) => {
  if (!a.size && !b.size) return 0
  let intersection = 0
  for (const t of a) if (b.has(t)) intersection++
  const union = a.size + b.size - intersection
  return union ? intersection / union : 0
}

const _humanizeKey = (key) =>
  String(key || "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const _looksLikeUrl = (value) => /^https?:\/\//i.test(String(value || ""))

const _formatContactMessage = (title, data) => {
  if (data == null) return `No encontré información para **${title}**.`

  if (typeof data === "string") {
    const v = data.trim()
    if (_looksLikeUrl(v)) return `Aquí tienes **${title}**: ${v}`
    return `Aquí tienes **${title}**: ${v}`
  }

  if (typeof data !== "object") {
    return `Aquí tienes **${title}**: ${String(data)}`
  }

  const lines = []
  const nombre = data.nombre || data.name
  const puesto = data.puesto || data.role
  const telefono = data.telefono || data.phone
  const correo = data.correo || data.email
  const direccion = data.direccion || data.address
  const sitioWeb = data.sitio_web || data.sitioWeb || data.website

  if (nombre) lines.push(`**Nombre**: ${nombre}`)
  if (puesto) lines.push(`**Puesto**: ${puesto}`)
  if (telefono) lines.push(`**Teléfono**: ${telefono}`)
  if (correo) lines.push(`**Correo**: ${correo}`)
  if (direccion) lines.push(`**Dirección**: ${direccion}`)
  if (sitioWeb) lines.push(`**Sitio web**: ${sitioWeb}`)

  // Also include any social links if present
  const redes = data.redes_sociales || data.redes || data.social
  if (redes && typeof redes === "object" && !Array.isArray(redes)) {
    for (const [k, v] of Object.entries(redes)) {
      if (!v) continue
      lines.push(`**${_humanizeKey(k)}**: ${v}`)
    }
  }

  if (lines.length === 0) {
    // Fallback: stringify small objects
    try {
      return `Aquí tienes **${title}**:\n\n${JSON.stringify(data, null, 2)}`
    } catch {
      return `Aquí tienes **${title}**.`
    }
  }

  return `Aquí tienes **${title}**:\n\n${lines.join("\n")}`
}

const _flattenContactResources = (root) => {
  const out = []
  const visit = (node, pathParts) => {
    if (node == null) return

    if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
      out.push({
        path: pathParts.join("."),
        title: _humanizeKey(pathParts[pathParts.length - 1] || "contacto"),
        data: String(node),
      })
      return
    }

    if (Array.isArray(node)) {
      node.forEach((item, idx) => visit(item, [...pathParts, String(idx)]))
      return
    }

    if (typeof node === "object") {
      const keys = Object.keys(node)
      const isContactCard =
        keys.includes("telefono") ||
        keys.includes("correo") ||
        keys.includes("email") ||
        keys.includes("direccion") ||
        keys.includes("sitio_web") ||
        keys.includes("nombre") ||
        keys.includes("puesto")

      if (isContactCard && pathParts.length) {
        out.push({
          path: pathParts.join("."),
          title: _humanizeKey(pathParts[pathParts.length - 1]),
          data: node,
        })

        // Treat contact cards as atomic: do not index leaf fields like `.puesto`.
        // This ensures queries return the full contact info instead of a single field.
        return
      }

      for (const [k, v] of Object.entries(node)) {
        visit(v, [...pathParts, k])
      }
    }
  }

  visit(root, [])
  return out
}

const _scoreContactEntry = (queryNorm, queryTokens, entry) => {
  const title = entry?.title || ""
  const path = entry?.path || ""

  let fields = ""
  if (entry?.data && typeof entry.data === "object") {
    const d = entry.data
    fields = [
      d.nombre,
      d.name,
      d.puesto,
      d.role,
      d.telefono,
      d.phone,
      d.correo,
      d.email,
      d.direccion,
      d.address,
      d.sitio_web,
      d.sitioWeb,
      d.website,
    ]
      .filter(Boolean)
      .join(" ")
  } else if (typeof entry?.data === "string") {
    fields = entry.data
  }

  const candidate = _normalize(`${title} ${path} ${fields}`)
  if (!candidate) return 0

  if (candidate.includes(queryNorm) || queryNorm.includes(candidate)) return 1

  const candTokens = _tokenSet(candidate)
  const j = _jaccard(queryTokens, candTokens)

  // Light boost if any token is a direct substring match
  let tokenBoost = 0
  for (const t of queryTokens) {
    if (t.length >= 4 && candidate.includes(t)) {
      tokenBoost = 0.15
      break
    }
  }

  return Math.min(1, 0.75 * j + tokenBoost)
}

/**
 * Handler para obtener información de contacto oficial CUCEI (tel/correo/áreas)
 */
export function handleGetContactResource(query) {
  try {
    const raw = String(query || "").trim()
    if (!raw) {
      return JSON.stringify({
        success: false,
        action: "contact",
        message: "Dime qué contacto necesitas (por ejemplo: 'servicios escolares', 'rectoría', 'teléfono CUCEI').",
      })
    }

    const entries = _flattenContactResources(CONTACT_RESOURCES)
    const queryNorm = _normalize(raw)
    const queryTokens = _tokenSet(raw)

    let best = null
    let bestScore = 0
    for (const e of entries) {
      const s = _scoreContactEntry(queryNorm, queryTokens, e)
      if (s > bestScore) {
        bestScore = s
        best = e
      }
    }

    if (!best || bestScore < 0.22) {
      return JSON.stringify({
        success: false,
        action: "contact",
        query: raw,
        message: `No encontré un contacto que coincida con "${raw}". ¿Puedes decirme el área o el nombre exacto?`,
      })
    }

    const message = _formatContactMessage(best.title, best.data)
    return JSON.stringify({
      success: true,
      action: "contact",
      query: raw,
      key: best.path,
      title: best.title,
      message,
      data: best.data,
    })
  } catch (error) {
    console.error("Error resolving contact resource:", error)
    return JSON.stringify({
      success: false,
      action: "contact",
      message: "Hubo un error al buscar el contacto. Intenta de nuevo.",
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
    // case "get_subject_material":
    //   return handleGetSubjectMaterial(args.subject, args.career)

    case "get_subject_study_plan":
      return handleGetSubjectStudyPlan(args.subject, args.career)

    case "get_curriculum":
      return handleGetCurriculum(args.career)

    case "show_location_on_map":
      return handleShowLocationOnMap(args.locationName)

    case "search_scholar_topic":
      return handleSearchScholarTopic(args.topic)

    case "get_contact_resource":
      return handleGetContactResource(args.query)

    default:
      console.warn(`[!] Unknown function: ${name}`)
      return ERROR_MESSAGES.unknownFunction(name)
  }
}

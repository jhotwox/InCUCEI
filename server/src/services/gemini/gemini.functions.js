import { Type } from "@google/genai"

// ============ Function Declarations ============

export const getSubjectMaterialDeclaration = {
  name: "get_subject_material",
  description: "Get study material for a given subject in CUCEI",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: {
        type: Type.STRING,
        description: "The subject name, e.g. Mathematics, Physics, Chemistry",
      },
    },
    required: ["subject"],
  },
}

export const getSubjectStudyPlanDeclaration = {
  name: "get_subject_study_plan",
  description: "Get study plan for a given subject in CUCEI",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: {
        type: Type.STRING,
        description: "The subject name, e.g. Mathematics, Physics, Chemistry",
      },
    },
    required: ["subject"],
  },
}

export const getSubjectsDeclaration = {
  name: "get_subjects",
  description: "Get all subjects in CUCEI",
}

export const showLocationOnMapDeclaration = {
  name: "show_location_on_map",
  description: "Shows a specific location on the CUCEI campus map. Use when user asks to see, find, show, or get directions to a building, classroom, bathroom, or any place on campus. Examples: '¿Dónde está el Módulo A?', 'Muéstrame la biblioteca', 'Llévame al baño más cercano', 'Quiero ir al Módulo B'",
  parameters: {
    type: Type.OBJECT,
    properties: {
      locationName: {
        type: Type.STRING,
        description: "Name of the location to search for (e.g., 'Modulo A', 'Biblioteca', 'Baño', 'Modulo B'). Can be partial name.",
      },
    },
    required: ["locationName"],
  },
}

// ============ Function Declarations Array ============
export const functionDeclarations = [
  getSubjectMaterialDeclaration,
  getSubjectStudyPlanDeclaration,
  getSubjectsDeclaration,
  showLocationOnMapDeclaration
]

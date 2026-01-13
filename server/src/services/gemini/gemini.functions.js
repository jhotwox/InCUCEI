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

// ============ Function Declarations Array ============
export const functionDeclarations = [
  getSubjectMaterialDeclaration,
  getSubjectStudyPlanDeclaration,
  getSubjectsDeclaration
]

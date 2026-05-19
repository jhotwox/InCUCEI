import { Type } from "@google/genai"

// ============ Function Declarations ============

// export const getSubjectMaterialDeclaration = {
//   name: "get_subject_material",
//   description: "Get study material for a given subject in CUCEI",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       subject: {
//         type: Type.STRING,
//         description: "The subject name, e.g. Mathematics, Physics, Chemistry",
//       },
//       // career: {
//       //   type: Type.STRING,
//       //   description: "Career code (required to disambiguate), e.g. INNI, INEA, LQFB, INFO, ILOT, LILT",
//       // },
//     },
//     required: ["subject"],
//   },
// }

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
      career: {
        type: Type.STRING,
        description: "Career code (required to disambiguate), e.g. INNI, INEA, LQFB, INFO, ILOT, LILT",
      },
    },
    required: ["subject"],
  },
}

export const getCurriculumDeclaration = {
  name: "get_curriculum",
  description: "Get curriculum for a given career in CUCEI",
  parameters: {
    type: Type.OBJECT,
    properties: {
      career: {
        type: Type.STRING,
        description: "The career name, e.g. INNI, INFO, INCE, ILOT, LILT, etc.",
      },
    },
    required: ["career"],
  },
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

export const searchScholarTopicDeclaration = {
  name: "search_scholar_topic",
  description: "Searches a topic on Google Scholar to find academic articles, papers, and other scholarly literature. Use this when the user asks for study material on a general topic, not the study plan of a specific subject from their curriculum.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: "The topic to search for on Google Scholar, e.g., 'Artificial Intelligence', 'Quantum Physics'",
      },
    },
    required: ["topic"],
  },
}

// ============ Function Declarations Array ============
export const functionDeclarations = [
  // getSubjectMaterialDeclaration,
  getSubjectStudyPlanDeclaration,
  getCurriculumDeclaration,
  showLocationOnMapDeclaration,
  searchScholarTopicDeclaration
]

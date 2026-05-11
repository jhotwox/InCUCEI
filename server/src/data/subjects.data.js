// All subject names need to have number in the end converted to arabic numerals
// and tildes removed for better matching
// and lowercase for better matching

import INNI from './INNI.data.json' with { type: "json" }
import INFO from './INFO.data.json' with { type: "json" }

export const subjectsData = {
  INNI: INNI,
  INFO: INFO,
  IC: {
    "calculo_diferencial": {
      name: "calculo diferencial",
      code: "MA101",
      files: {
        "study_plan": "calculodiferencial.pdf",
        "material": "calculodiferencial_material.pdf"
      },
      career: "IC"
    },
  }
}

// All subject names need to have number in the end converted to arabic numerals
// and tildes removed for better matching
// and lowercase for better matching

import INNI from './INNI.data.json' with { type: "json" }
import INFO from './INFO.data.json' with { type: "json" }
import LILT from './LILT.data.json' with { type: "json" }
import ILOT from './ILOT.data.json' with { type: "json" }
import INRO from './INRO.data.json' with { type: "json" }
import INCE from './INCE.data.json' with { type: "json" }
import INEA from './INEA.data.json' with { type: "json" }
// ICOM is not included because we couldn't find study plans for it
import INBI from './INBI.data.json' with { type: "json" }
import INME from './INME.data.json' with { type: "json" }
import INDU from './INDU.data.json' with { type: "json" }


export const subjectsData = {
  INNI: INNI,
  INFO: INFO,
  LILT: LILT,
  ILOT: ILOT,
  INRO: INRO,
  INCE: INCE,
  INEA: INEA,
  INBI: INBI,
  INME: INME,
  INDU: INDU,
}

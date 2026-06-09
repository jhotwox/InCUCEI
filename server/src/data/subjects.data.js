// All subject names need to have number in the end converted to arabic numerals
// and tildes removed for better matching
// and lowercase for better matching
import IGFO from './IGFO.data.json' with { type: "json" }
import ILOT from './ILOT.data.json' with { type: "json" }
import INBI from './INBI.data.json' with { type: "json" }
import INCE from './INCE.data.json' with { type: "json" }
import INDU from './INDU.data.json' with { type: "json" }
import INEA from './INEA.data.json' with { type: "json" }
import INFO from './INFO.data.json' with { type: "json" }
import INME from './INME.data.json' with { type: "json" }
import INNI from './INNI.data.json' with { type: "json" }
import INRO from './INRO.data.json' with { type: "json" }
import ITOG from './ITOG.data.json' with { type: "json" }
import LILT from './LILT.data.json' with { type: "json" }
import ICIV from './ICIV.data.json' with { type: "json" }
import LQFB from './LQFB.data.json' with { type: "json" }
import LQUI from './LQUI.data.json' with { type: "json" }
import LIMA from './LIMA.data.json' with { type: "json" }
// IMEI is not included because we couldn't find study plans for it
// ICOM is not included because we couldn't find study plans for it
// LINA is not included because we couldn't find study plans for it
// ICIM is not included because we couldn't find study plans for it
// LIFI is not included because we couldn't find study plans for it


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
  ITOG: ITOG,
  IGFO: IGFO,
  ICIV: ICIV,
  LQFB: LQFB,
  LQUI: LQUI,
  LIMA: LIMA
}

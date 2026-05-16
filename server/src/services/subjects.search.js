import Fuse from "fuse.js"
import { subjectsData } from "../data/subjects.data.js"
import { formatSubjectName } from "../libs/string.utils.js"

const STOPWORDS = new Set(["de", "la", "del", "y", "e", "en", "a", "al"])

const ACRONYM_EQUIVALENTS = new Map([
  // Common interchangeable acronyms
  ["DB", "BD"],
  ["AI", "IA"],
])

const TOKEN_EQUIVALENTS = new Map([
  //* Common singular/plural and shorthand normalizations
  ["base", "bases"],
  ["dato", "datos"],
  ["servidor", "servidores"],
  ["red", "redes"],
  ["sim", "simulacion"],
  ["sis", "sistemas"],
  ["lab", "laboratorio"],

  //* manual singular/plural that aren't just adding 's'
  // ["fundamento", "fundamentos"],
  // ["objeto", "objetos"],
  ["ecucacion", "ecuaciones"],
  ["diferencial", "diferenciales"],
  // ["estructura", "estructuras"],
  // ["metodo", "metodos"],
  // ["numerico", "numericos"],
  // ["computadora", "computadoras"],
  // ["metaheuristico", "metaheuristicos"],
  // ["inteligente", "inteligentes"],
  // ["proyecto", "proyectos"],

  //* Simple synonym
  ["algoritmos", "algoritmia"],
])

const isLikelyAcronymQuery = (query) => {
  const q = String(query || "").trim()
  if (!q) return false
  // 2-6 chars, letters/digits only
  return /^[A-Z0-9]{2,6}$/.test(q)
}

const sanitizeAcronymQuery = (query) => {
  const raw = String(query || "")
  const ac = raw.replace(/[^a-z0-9]/gi, "").toUpperCase()
  return ac
}

const shouldTreatAsAcronym = (queryRaw, acronym) => {
  if (!isLikelyAcronymQuery(acronym)) return false

  const parts = String(queryRaw || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length <= 1) return true

  // If it's spaced/dotted letters like "B. D" treat as acronym.
  const allSingleChar = parts.every((p) => sanitizeAcronymQuery(p).length === 1)
  if (allSingleChar) return true

  return false
}

const normalizeForSearch = (text) => {
  let s = formatSubjectName(String(text || ""))
  // remove punctuation/symbols -> space
  s = s.replace(/[^a-z0-9\s]/gi, " ")
  s = s.replace(/\s+/g, " ").trim()
  return s
}

const tokenize = (text) => normalizeForSearch(text).split(" ").filter(Boolean)

const removeStopwords = (tokens) => tokens.filter((t) => !STOPWORDS.has(t))

const expandAbbreviations = (tokens) => {
  // Small, high-value expansions to avoid manually enumerating every variant.
  // Keep this list minimal and generic.
  const expanded = []
  for (const token of tokens) {
    const t = token.toLowerCase()
    if (t === "adm" || t === "admin" || t === "ad") {
      expanded.push("administracion")
      continue
    }
    if (t === "ing") {
      expanded.push("ingenieria")
      continue
    }
    if (t === "s" || t === "soft" || t === "sw") {
      expanded.push("software")
      continue
    }
    if (t === "bd" || t === "db") {
      expanded.push("bases", "datos")
      continue
    }
    expanded.push(t)
  }

  // Domain-friendly shortcut: "calculo 1" is commonly used for "calculo diferencial".
  // Replace the digit token with the semantic token to allow subset matching.
  if (expanded.includes("calculo") && expanded.includes("1")) {
    const out = []
    for (const t of expanded) {
      if (t === "1") continue
      out.push(t)
    }
    out.push("diferencial")
    return out
  }

  return expanded
}

const normalizeToken = (token) => {
  const t = String(token || "").toLowerCase()
  if (!t) return ""
  if (/^\d+$/.test(t)) return t

  if (TOKEN_EQUIVALENTS.has(t)) return TOKEN_EQUIVALENTS.get(t)
  // If it already is the canonical value, keep it.
  for (const [from, to] of TOKEN_EQUIVALENTS.entries()) {
    if (t === to) return to
    if (t === from) return to
  }

  // Very small heuristic: treat singular token as plural if adding 's' matches common patterns.
  // Keeps it conservative: only when token is alphabetic.
  if (/^[a-z]+$/.test(t) && !t.endsWith("s")) return t
  return t
}

const normalizeTokens = (tokens) => tokens.map(normalizeToken).filter(Boolean)

const isRomanNumeralToken = (token) => {
  const t = String(token || "").toLowerCase()
  if (!t) return false
  // Keep it conservative: common course numerals only.
  // This allows: i, ii, iii, iv, v, vi, vii, viii, ix, x, xi, xii
  return /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/.test(t)
}

const acronymFromTokens = (tokens) => {
  if (!Array.isArray(tokens) || tokens.length === 0) return ""
  return tokens
    .map((t) => {
      if (/^\d+$/.test(t)) return t
      if (isRomanNumeralToken(t)) return String(t).toUpperCase()
      return t[0]?.toUpperCase() || ""
    })
    .join("")
}

const tokenizeForAcronymsRaw = (text) => {
  // Similar to search tokenization, but DO NOT convert roman numerals.
  // This preserves acronyms like "ISI".
  const s = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  return s.split(" ").filter(Boolean)
}

const generateAcronyms = (name) => {
  const tokensAllRaw = tokenizeForAcronymsRaw(name)
  const tokensNoStopRaw = removeStopwords(tokensAllRaw)

  const tokensAllFormatted = tokenize(name)
  const tokensNoStopFormatted = removeStopwords(tokensAllFormatted)

  const out = new Set()

  // Full acronyms (raw + formatted)
  out.add(acronymFromTokens(tokensNoStopRaw)) // e.g. "AS", "BD", "ISI"
  out.add(acronymFromTokens(tokensNoStopFormatted)) // e.g. "AS", "BD", "IS1"

  // Acronym including stopwords only if it stays reasonably short (or as prefixes)
  const allAcronym = acronymFromTokens(tokensAllRaw)
  if (allAcronym.length >= 2 && allAcronym.length <= 6) out.add(allAcronym)

  // Prefix acronyms (capture things like ADB, ADS)
  const maxPrefix = Math.min(4, tokensAllRaw.length)
  for (let n = 2; n <= maxPrefix; n++) {
    const a = acronymFromTokens(tokensAllRaw.slice(0, n))
    if (a.length >= 2 && a.length <= 6) out.add(a)
  }

  const maxPrefixNoStop = Math.min(4, tokensNoStopRaw.length)
  for (let n = 2; n <= maxPrefixNoStop; n++) {
    const a = acronymFromTokens(tokensNoStopRaw.slice(0, n))
    if (a.length >= 2 && a.length <= 6) out.add(a)
  }

  return Array.from(out).filter(Boolean)
}

const buildSubjectsIndex = () => {
  return Object.entries(subjectsData).flatMap(([careerKey, career]) =>
    Object.entries(career).map(([key, subject]) => {
      const name = subject.name || key
      const nameSearchTokens = normalizeTokens(
        expandAbbreviations(removeStopwords(tokenize(name)))
      )
      const nameSearch = nameSearchTokens.join(" ")

      // Generate acronyms from both raw and formatted name to support
      // queries like "ISI" (roman) and "IS1" (arabic), plus dotted queries.
      const acronyms = Array.from(
        new Set([
          ...generateAcronyms(name),
          ...generateAcronyms(formatSubjectName(name)),
        ])
      )

      const tokenSet = new Set(nameSearchTokens)

      return {
        key,
        career: careerKey,
        name,
        code: subject.code,
        nameSearch,
        acronyms,
        tokenSet,
      }
    })
  )
}

const SUBJECTS_INDEX = buildSubjectsIndex()

const makeFuse = (items) => {
  return new Fuse(items, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.35,
    minMatchCharLength: 2,
    keys: [
      { name: "code", weight: 0.3 },
      { name: "acronyms", weight: 0.25 },
      { name: "key", weight: 0.15 },
      { name: "nameSearch", weight: 0.3 },
    ],
  })
}

const FUSE_ALL = makeFuse(SUBJECTS_INDEX)
const FUSE_BY_CAREER = new Map()

const getFuseForCareer = (career) => {
  const c = String(career || "").toUpperCase()
  if (!c) return FUSE_ALL
  if (FUSE_BY_CAREER.has(c)) return FUSE_BY_CAREER.get(c)

  const items = SUBJECTS_INDEX.filter((s) => s.career === c)
  const fuse = makeFuse(items)
  FUSE_BY_CAREER.set(c, fuse)
  return fuse
}

export const getAllSubjects = () => {
  return SUBJECTS_INDEX.map(({ key, name, code, career }) => ({
    key,
    name,
    code,
    career,
  }))
}

// MARK: Main functions
export const resolveSubject = (subjectQuery, opts = {}) => {
  const { career = null, limit = 5 } = opts
  const queryRaw = String(subjectQuery || "").trim()
  if (!queryRaw) return []

  const careerKey = career ? String(career).toUpperCase() : null

  // 1) Exact key match
  if (careerKey && subjectsData[careerKey]?.[queryRaw.toLowerCase()]) {
    return [
      {
        item: {
          key: queryRaw.toLowerCase(),
          career: careerKey,
          ...subjectsData[careerKey][queryRaw.toLowerCase()],
        },
        score: 0,
        reason: "exact_key",
      },
    ]
  }

  // 2) Exact code match
  const code = queryRaw.toUpperCase()
  const codeMatches = SUBJECTS_INDEX.filter(
    (s) => (!careerKey || s.career === careerKey) && s.code?.toUpperCase() === code
  )
  if (codeMatches.length > 0) {
    return codeMatches.slice(0, limit).map((s) => ({
      item: s,
      score: 0,
      reason: "exact_code",
    }))
  }

  // 3) Acronym exact/prefix match (BD, B.D., ADS, A. D. S., IS, ISI, etc.)
  const acRaw = sanitizeAcronymQuery(queryRaw)
  const acCanonical = ACRONYM_EQUIVALENTS.get(acRaw) || acRaw
  const acCandidates = Array.from(new Set([acRaw, acCanonical].filter(Boolean)))

  if (shouldTreatAsAcronym(queryRaw, acRaw)) {
    const matches = SUBJECTS_INDEX.filter((s) => {
      if (careerKey && s.career !== careerKey) return false
      return acCandidates.some((ac) => s.acronyms.includes(ac))
    })

    if (matches.length > 0) {
      return matches.slice(0, limit).map((s) => ({
        item: s,
        score: 0,
        reason: "exact_acronym",
      }))
    }

    // Prefix acronym match (e.g. "IS" should match "ISI"/"IS1")
    const prefixMatches = SUBJECTS_INDEX.filter((s) => {
      if (careerKey && s.career !== careerKey) return false
      return acCandidates.some((ac) => s.acronyms.some((a) => a.startsWith(ac)))
    })

    if (prefixMatches.length > 0) {
      // Prefer the shortest matching acronym to reduce ambiguity
      const scored = prefixMatches
        .map((s) => {
          const lens = []
          for (const ac of acCandidates) {
            for (const a of s.acronyms) {
              if (a.startsWith(ac)) lens.push(a.length)
            }
          }
          const bestLen = lens.length ? Math.min(...lens) : 999
          return { s, bestLen }
        })
        .sort((a, b) => a.bestLen - b.bestLen)

      return scored.slice(0, limit).map(({ s }) => ({
        item: s,
        score: 0,
        reason: "prefix_acronym",
      }))
    }

    // If it looks like an acronym and we didn't match it, don't let Fuse guess.
    return []
  }

  // 3.5) Token-set exact/subset match (handles singular/plural like "base"->"bases")
  const queryTokens = normalizeTokens(
    expandAbbreviations(removeStopwords(tokenize(queryRaw)))
  )
  if (queryTokens.length > 0) {
    const candidates = SUBJECTS_INDEX.filter((s) => !careerKey || s.career === careerKey)
    const subsetMatches = []
    for (const s of candidates) {
      let allPresent = true
      for (const qt of queryTokens) {
        if (!s.tokenSet.has(qt)) {
          allPresent = false
          break
        }
      }
      if (allPresent) {
        const extraTokens = Math.max(0, s.tokenSet.size - queryTokens.length)
        subsetMatches.push({ s, extraTokens })
      }
    }

    if (subsetMatches.length > 0) {
      subsetMatches.sort((a, b) => a.extraTokens - b.extraTokens)
      return subsetMatches.slice(0, limit).map(({ s }) => ({
        item: s,
        score: 0,
        reason: "token_subset",
      }))
    }
  }

  // 4) Fuzzy match over normalized/expanded query
  const query = queryTokens.join(" ")
  const fuse = getFuseForCareer(careerKey)
  const results = fuse.search(query, { limit })

  return results
    .filter((r) => typeof r.score === "number" && r.score <= 0.45)
    .map((r) => ({
      item: r.item,
      score: r.score,
      reason: "fuse",
    }))
}

export const getSubjectByName = (name) => {
  const results = resolveSubject(name, { limit: 1 })
  const best = results[0]?.item
  if (!best) return null

  return {
    key: best.key,
    name: best.name,
    code: best.code,
    career: best.career,
  }
}

// console.log("Subjects index: ", SUBJECTS_INDEX)
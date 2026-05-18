from __future__ import annotations

from dataclasses import dataclass
import difflib
import json
import os
import re
import unicodedata
from typing import Any, Dict, List, Optional, Text, Tuple

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
SUBJECTS_JSON_PATH = os.path.join(DATA_DIR, "subjects.json")
PLACES_JSON_PATH = os.path.join(DATA_DIR, "places.json")
CAREERS_JSON_PATH = os.path.join(DATA_DIR, "careers.json")

# Monorepo paths (keeps catalogs in sync with the Node backend without requiring
# any backend changes).
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SERVER_ROOT = os.path.abspath(os.path.join(PROJECT_ROOT, "..", "server"))
SERVER_DATA_DIR = os.path.join(SERVER_ROOT, "src", "data")
SERVER_FILES_DIR = os.path.join(SERVER_ROOT, "src", "files")

# This should point to the InCUCEI server serving /files/* endpoints.
SERVER_BASE_URL = os.environ.get("INCUCEI_SERVER_BASE_URL", "http://localhost:3000")


def _strip_accents(text: str) -> str:
    return "".join(
        ch for ch in unicodedata.normalize("NFD", text) if unicodedata.category(ch) != "Mn"
    )


def _roman_to_arabic_end(text: str) -> str:
    """Convert trailing roman numerals (I, II, III, IV, V...) to arabic digits."""
    roman_map = {
        "i": "1",
        "ii": "2",
        "iii": "3",
        "iv": "4",
        "v": "5",
        "vi": "6",
        "vii": "7",
        "viii": "8",
        "ix": "9",
        "x": "10",
    }

    parts = text.strip().split()
    if not parts:
        return text

    last = parts[-1].lower()
    if last in roman_map:
        parts[-1] = roman_map[last]
        return " ".join(parts)
    return text


def _normalize(text: str) -> str:
    text = text or ""
    text = _strip_accents(text)
    text = text.lower().strip()
    text = _roman_to_arabic_end(text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


@dataclass(frozen=True)
class SubjectEntry:
    key: str
    career: str
    name: str
    code: str
    material_file: str
    study_plan_file: str
    name_search: str
    acronyms: Tuple[str, ...]
    token_set: frozenset[str]


STOPWORDS = {"de", "la", "del", "y", "e", "en", "a", "al"}

ACRONYM_EQUIVALENTS = {
    "DB": "BD",
    "AI": "IA",
}

TOKEN_EQUIVALENTS = {
    "base": "bases",
    "dato": "datos",
    "servidor": "servidores",
    "red": "redes",
    "sim": "simulacion",
    "sis": "sistemas",
    "lab": "laboratorio",
    "ecucacion": "ecuaciones",
    "diferencial": "diferenciales",
    "algoritmos": "algoritmia",
}


def _is_likely_acronym_query(query: str) -> bool:
    q = str(query or "").strip()
    if not q:
        return False
    return bool(re.fullmatch(r"[A-Z0-9]{2,6}", q))


def _sanitize_acronym_query(query: str) -> str:
    raw = str(query or "")
    return re.sub(r"[^A-Za-z0-9]", "", raw).upper()


def _should_treat_as_acronym(query_raw: str, acronym: str) -> bool:
    if not _is_likely_acronym_query(acronym):
        return False

    parts = [p for p in str(query_raw or "").strip().split() if p]
    if len(parts) <= 1:
        return True

    # If it's spaced/dotted letters like "B. D" treat as acronym.
    all_single_char = all(len(_sanitize_acronym_query(p)) == 1 for p in parts)
    return all_single_char


def _normalize_for_search(text: str) -> str:
    # Keep it similar to server/src/services/subjects.search.js
    s = _normalize(str(text or ""))
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _tokenize(text: str) -> List[str]:
    return [t for t in _normalize_for_search(text).split(" ") if t]


def _remove_stopwords(tokens: List[str]) -> List[str]:
    return [t for t in tokens if t not in STOPWORDS]


def _expand_abbreviations(tokens: List[str]) -> List[str]:
    expanded: List[str] = []
    for token in tokens:
        t = token.lower()
        if t in {"adm", "admin", "ad"}:
            expanded.append("administracion")
            continue
        if t == "ing":
            expanded.append("ingenieria")
            continue
        if t in {"s", "soft", "sw"}:
            expanded.append("software")
            continue
        if t in {"bd", "db"}:
            expanded.extend(["bases", "datos"])
            continue
        expanded.append(t)

    # Domain shortcut: "calculo 1" often means "calculo diferencial".
    if "calculo" in expanded and "1" in expanded:
        out = [t for t in expanded if t != "1"]
        out.append("diferencial")
        return out

    return expanded


def _normalize_token(token: str) -> str:
    t = str(token or "").lower()
    if not t:
        return ""
    if t.isdigit():
        return t

    if t in TOKEN_EQUIVALENTS:
        return TOKEN_EQUIVALENTS[t]

    # If it already is a canonical value, keep it.
    for _from, _to in TOKEN_EQUIVALENTS.items():
        if t == _to:
            return _to
        if t == _from:
            return _to

    return t


def _normalize_tokens(tokens: List[str]) -> List[str]:
    return [t for t in (_normalize_token(x) for x in tokens) if t]


def _is_roman_numeral_token(token: str) -> bool:
    t = str(token or "").lower()
    return bool(re.fullmatch(r"i|ii|iii|iv|v|vi|vii|viii|ix|x", t))


def _acronym_from_tokens(tokens: List[str]) -> str:
    if not tokens:
        return ""
    out = []
    for t in tokens:
        if t.isdigit():
            out.append(t)
            continue
        if _is_roman_numeral_token(t):
            out.append(t.upper())
            continue
        out.append((t[0] if t else "").upper())
    return "".join(out)


def _tokenize_for_acronyms_raw(text: str) -> List[str]:
    # Similar to search tokenization but DO NOT convert roman numerals.
    s = str(text or "").lower()
    s = _strip_accents(s)
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return [t for t in s.split(" ") if t]


def _generate_acronyms(name: str) -> List[str]:
    tokens_all_raw = _tokenize_for_acronyms_raw(name)
    tokens_no_stop_raw = _remove_stopwords(tokens_all_raw)

    tokens_all_formatted = _tokenize(name)
    tokens_no_stop_formatted = _remove_stopwords(tokens_all_formatted)

    out: set[str] = set()

    out.add(_acronym_from_tokens(tokens_no_stop_raw))
    out.add(_acronym_from_tokens(tokens_no_stop_formatted))

    all_acronym = _acronym_from_tokens(tokens_all_raw)
    if 2 <= len(all_acronym) <= 6:
        out.add(all_acronym)

    max_prefix = min(4, len(tokens_all_raw))
    for n in range(2, max_prefix + 1):
        a = _acronym_from_tokens(tokens_all_raw[:n])
        if 2 <= len(a) <= 6:
            out.add(a)

    max_prefix_no_stop = min(4, len(tokens_no_stop_raw))
    for n in range(2, max_prefix_no_stop + 1):
        a = _acronym_from_tokens(tokens_no_stop_raw[:n])
        if 2 <= len(a) <= 6:
            out.add(a)

    return [a for a in out if a]


def _load_subjects_from_server_data() -> Dict[str, Dict[str, Any]]:
    # Reads server/src/data/*.data.json
    if not os.path.isdir(SERVER_DATA_DIR):
        return {}

    subjects_by_career: Dict[str, Dict[str, Any]] = {}
    for filename in os.listdir(SERVER_DATA_DIR):
        if not filename.endswith(".data.json"):
            continue
        career = filename.split(".")[0].upper()
        if not re.fullmatch(r"[A-Z]{4}", career):
            continue

        file_path = os.path.join(SERVER_DATA_DIR, filename)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                subjects_by_career[career] = json.load(f)
        except Exception:
            continue

    return subjects_by_career


def _load_subjects_from_local_json() -> Dict[str, Dict[str, Any]]:
    if not os.path.exists(SUBJECTS_JSON_PATH):
        return {}
    with open(SUBJECTS_JSON_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, dict):
        return raw
    return {}


def _build_subject_index(subjects_by_career: Dict[str, Dict[str, Any]]) -> Tuple[List[SubjectEntry], Dict[Tuple[str, str], SubjectEntry]]:
    entries: List[SubjectEntry] = []
    by_key: Dict[Tuple[str, str], SubjectEntry] = {}

    for career_key, career_subjects in subjects_by_career.items():
        if not isinstance(career_subjects, dict):
            continue
        for key, subject in career_subjects.items():
            if not isinstance(subject, dict):
                continue
            files = subject.get("files", {}) or {}
            name = subject.get("name")
            if not name:
                # Backward compatibility with older subjects.json ("names" list)
                names = subject.get("names", []) or []
                name = names[0] if names else key

            tokens = _normalize_tokens(
                _expand_abbreviations(_remove_stopwords(_tokenize(name)))
            )
            name_search = " ".join(tokens)

            acronyms = sorted(set(_generate_acronyms(name) + _generate_acronyms(_normalize(name))))
            token_set = frozenset(tokens)

            entry = SubjectEntry(
                key=str(key),
                career=str(subject.get("career", career_key)).upper(),
                name=str(name),
                code=str(subject.get("code", "")),
                material_file=str(files.get("material", "")),
                study_plan_file=str(files.get("study_plan", "")),
                name_search=name_search,
                acronyms=tuple(acronyms),
                token_set=token_set,
            )
            entries.append(entry)
            by_key[(entry.career, entry.key)] = entry

    return entries, by_key


def _load_career_catalog(default_codes: List[str]) -> List[Dict[str, Any]]:
    # Optional, used to resolve aliases like "informatica" -> INNI/INFO.
    if os.path.exists(CAREERS_JSON_PATH):
        try:
            with open(CAREERS_JSON_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
            if isinstance(raw, list):
                return raw
        except Exception:
            pass

    # Fallback: known codes from data.
    return [{"code": c, "name": "", "aliases": []} for c in sorted(default_codes)]


def _build_career_resolver(catalog: List[Dict[str, Any]]) -> Tuple[set[str], Dict[str, List[str]]]:
    known_codes: set[str] = set()
    alias_to_codes: Dict[str, List[str]] = {}

    for item in catalog:
        code = str(item.get("code", "")).upper().strip()
        if not code:
            continue
        known_codes.add(code)

        name = str(item.get("name", "") or "").strip()
        aliases = item.get("aliases", []) or []

        for raw in [name, *aliases]:
            norm = _normalize(str(raw or ""))
            if not norm:
                continue
            alias_to_codes.setdefault(norm, [])
            if code not in alias_to_codes[norm]:
                alias_to_codes[norm].append(code)

    return known_codes, alias_to_codes


def _resolve_career_code(value: str, known_codes: set[str], alias_to_codes: Dict[str, List[str]]) -> Tuple[Optional[str], Optional[List[str]]]:
    # Returns (code, ambiguous_codes)
    if not value:
        return None, None

    # 1) Direct code inside text
    upper = str(value).upper()
    for token in re.findall(r"\b[A-Z]{4}\b", upper):
        if token in known_codes:
            return token, None

    # 2) Alias/name match
    norm = _normalize(str(value))
    if not norm:
        return None, None

    candidates = set()
    for alias_norm, codes in alias_to_codes.items():
        if not alias_norm:
            continue
        if norm == alias_norm or norm in alias_norm or alias_norm in norm:
            for c in codes:
                if c in known_codes:
                    candidates.add(c)

    if len(candidates) == 1:
        return next(iter(candidates)), None
    if len(candidates) > 1:
        return None, sorted(candidates)
    return None, None


def _resolve_subject(subject_query: str, career: Optional[str], subjects_index: List[SubjectEntry], subjects_by_key: Dict[Tuple[str, str], SubjectEntry]) -> Optional[SubjectEntry]:
    query_raw = str(subject_query or "").strip()
    if not query_raw:
        return None

    career_key = str(career).upper().strip() if career else None

    # 1) Exact key match
    if career_key:
        key = query_raw.lower()
        exact = subjects_by_key.get((career_key, key))
        if exact:
            return exact

    # 2) Exact code match
    code = query_raw.upper().strip()
    for s in subjects_index:
        if career_key and s.career != career_key:
            continue
        if s.code and s.code.upper() == code:
            return s

    # 3) Acronym match
    ac_raw = _sanitize_acronym_query(query_raw)
    ac_canonical = ACRONYM_EQUIVALENTS.get(ac_raw, ac_raw)
    ac_candidates = [x for x in {ac_raw, ac_canonical} if x]

    if _should_treat_as_acronym(query_raw, ac_raw):
        matches = [
            s
            for s in subjects_index
            if (not career_key or s.career == career_key)
            and any(ac in s.acronyms for ac in ac_candidates)
        ]
        if matches:
            return matches[0]

        prefix_matches = [
            s
            for s in subjects_index
            if (not career_key or s.career == career_key)
            and any(any(a.startswith(ac) for a in s.acronyms) for ac in ac_candidates)
        ]
        if prefix_matches:
            return prefix_matches[0]

        # If it looks like an acronym and didn't match, don't guess.
        return None

    # 3.5) Token subset match
    query_tokens = _normalize_tokens(
        _expand_abbreviations(_remove_stopwords(_tokenize(query_raw)))
    )
    if query_tokens:
        candidates = [s for s in subjects_index if not career_key or s.career == career_key]
        subset_matches: List[Tuple[int, SubjectEntry]] = []
        for s in candidates:
            if all(qt in s.token_set for qt in query_tokens):
                extra = max(0, len(s.token_set) - len(query_tokens))
                subset_matches.append((extra, s))
        if subset_matches:
            subset_matches.sort(key=lambda x: x[0])
            return subset_matches[0][1]

    # 4) Fuzzy match over normalized query
    query = " ".join(query_tokens)
    if not query:
        return None

    best: Optional[Tuple[float, SubjectEntry]] = None
    for s in subjects_index:
        if career_key and s.career != career_key:
            continue
        ratio = difflib.SequenceMatcher(None, query, s.name_search).ratio()
        if best is None or ratio > best[0]:
            best = (ratio, s)

    if best and best[0] >= 0.55:
        return best[1]
    return None


def _load_places() -> List[Dict[str, Any]]:
    if not os.path.exists(PLACES_JSON_PATH):
        return []
    with open(PLACES_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


_subjects_from_server = _load_subjects_from_server_data()
_subjects_from_local = _load_subjects_from_local_json()

# Prefer server catalog if available (most up-to-date)
SUBJECTS_RAW = _subjects_from_server or _subjects_from_local
SUBJECTS, SUBJECTS_BY_KEY = _build_subject_index(SUBJECTS_RAW)

_career_catalog = _load_career_catalog(list(SUBJECTS_RAW.keys()))
KNOWN_CAREER_CODES, CAREER_ALIAS_TO_CODES = _build_career_resolver(_career_catalog)

PLACES = _load_places()


def _find_subject(query: str, career: Optional[str]) -> Optional[SubjectEntry]:
    return _resolve_subject(query, career, SUBJECTS, SUBJECTS_BY_KEY)


def _build_material_url(entry: SubjectEntry) -> str:
    # Mirrors server/src/services/subjects.service.js
    return f"{SERVER_BASE_URL}/files/material/{entry.career}/{entry.material_file}"


def _build_study_plan_url(entry: SubjectEntry) -> str:
    return f"{SERVER_BASE_URL}/files/study_plan/{entry.career}/{entry.study_plan_file}"


def _find_place(query: str) -> Optional[Dict[str, Any]]:
    normalized = _normalize(query)
    if not normalized:
        return None

    for place in PLACES:
        name_norm = _normalize(place.get("name", ""))
        if normalized in name_norm or name_norm in normalized:
            return place

        aliases = place.get("alias") or place.get("aliases") or []
        for a in aliases:
            a_norm = _normalize(str(a))
            if not a_norm:
                continue
            if normalized in a_norm or a_norm in normalized:
                return place
    return None


def _get_entity_value(tracker: Tracker, entity_name: str) -> Optional[str]:
    entities = tracker.latest_message.get("entities", []) or []
    for ent in entities:
        if ent.get("entity") == entity_name and ent.get("value"):
            return str(ent.get("value"))
    return None


class ActionGetSubjectMaterial(Action):
    def name(self) -> Text:
        return "action_get_subject_material"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        topic = tracker.get_slot("topic") or _get_entity_value(tracker, "subject")
        career_raw = tracker.get_slot("career_code") or _get_entity_value(tracker, "career_code")
        if not topic:
            dispatcher.utter_message(response="utter_ask_topic")
            return []

        if not career_raw:
            dispatcher.utter_message(response="utter_ask_career_code")
            return []

        career_code, ambiguous = _resolve_career_code(str(career_raw), KNOWN_CAREER_CODES, CAREER_ALIAS_TO_CODES)
        if ambiguous:
            dispatcher.utter_message(
                text=(
                    "Necesito el código exacto de tu carrera. "
                    f"Con ese nombre podría ser: {', '.join(ambiguous)}. "
                    "¿Cuál es el tuyo?"
                )
            )
            return [SlotSet("career_code", None)]

        if not career_code:
            dispatcher.utter_message(response="utter_invalid_career_code")
            return [SlotSet("career_code", None)]

        entry = _find_subject(str(topic), career_code)
        if not entry or not entry.material_file:
            dispatcher.utter_message(response="utter_material_not_found")
            return []

        url = _build_material_url(entry)
        dispatcher.utter_message(
            text=f"Aquí encontrarás el material de {entry.name or topic}: {url}",
            metadata={
                "subject": entry.name or str(topic),
                "code": entry.code,
                "file": entry.material_file,
                "path": url,
                "career": entry.career,
            },
        )
        return [SlotSet("topic", str(topic)), SlotSet("career_code", career_code)]


class ActionGetSubjectStudyPlan(Action):
    def name(self) -> Text:
        return "action_get_subject_study_plan"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        topic = tracker.get_slot("topic") or _get_entity_value(tracker, "subject")
        career_raw = tracker.get_slot("career_code") or _get_entity_value(tracker, "career_code")
        if not topic:
            dispatcher.utter_message(response="utter_ask_topic")
            return []

        if not career_raw:
            dispatcher.utter_message(response="utter_ask_career_code")
            return []

        career_code, ambiguous = _resolve_career_code(str(career_raw), KNOWN_CAREER_CODES, CAREER_ALIAS_TO_CODES)
        if ambiguous:
            dispatcher.utter_message(
                text=(
                    "Necesito el código exacto de tu carrera. "
                    f"Con ese nombre podría ser: {', '.join(ambiguous)}. "
                    "¿Cuál es el tuyo?"
                )
            )
            return [SlotSet("career_code", None)]

        if not career_code:
            dispatcher.utter_message(response="utter_invalid_career_code")
            return [SlotSet("career_code", None)]

        entry = _find_subject(str(topic), career_code)
        if not entry or not entry.study_plan_file:
            dispatcher.utter_message(response="utter_study_plan_not_found")
            return []

        url = _build_study_plan_url(entry)
        dispatcher.utter_message(
            text=f"Aquí encontrarás el plan de estudios de {entry.name or topic}: {url}",
            metadata={
                "subject": entry.name or str(topic),
                "code": entry.code,
                "file": entry.study_plan_file,
                "path": url,
                "career": entry.career,
            },
        )
        return [SlotSet("topic", str(topic)), SlotSet("career_code", career_code)]


class ActionGetCurriculum(Action):
    def name(self) -> Text:
        return "action_get_curriculum"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        career_raw = tracker.get_slot("career_code") or _get_entity_value(tracker, "career_code")
        if not career_raw:
            dispatcher.utter_message(response="utter_ask_career_code")
            return []

        career_code, ambiguous = _resolve_career_code(str(career_raw), KNOWN_CAREER_CODES, CAREER_ALIAS_TO_CODES)
        if ambiguous:
            dispatcher.utter_message(
                text=(
                    "Necesito el código exacto de tu carrera. "
                    f"Con ese nombre podría ser: {', '.join(ambiguous)}. "
                    "¿Cuál es el tuyo?"
                )
            )
            return [SlotSet("career_code", None)]

        if not career_code:
            dispatcher.utter_message(response="utter_invalid_career_code")
            return [SlotSet("career_code", None)]

        file_name = f"{career_code}.pdf"
        local_path = os.path.join(SERVER_FILES_DIR, "Mallas", file_name)
        if os.path.isdir(SERVER_FILES_DIR) and not os.path.exists(local_path):
            dispatcher.utter_message(response="utter_curriculum_not_found")
            return []

        url = f"{SERVER_BASE_URL}/files/Mallas/{file_name}"
        dispatcher.utter_message(
            text=f"Aquí está la malla curricular de {career_code}: {url}",
            metadata={
                "career": career_code,
                "file": file_name,
                "path": url,
            },
        )
        return [SlotSet("career_code", career_code)]


class ActionGetSubjects(Action):
    def name(self) -> Text:
        return "action_get_subjects"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        if not SUBJECTS:
            dispatcher.utter_message(text="No tengo materias cargadas en este momento.")
            return []

        sample = []
        for entry in SUBJECTS[:15]:
            if entry.name:
                sample.append(entry.name)

        dispatcher.utter_message(
            text=(
                f"Tengo registradas {len(SUBJECTS)} materias. "
                f"Algunas son: {', '.join(sample)}. "
                "Dime el nombre exacto (o aproximado) y te paso material o plan."
            )
        )
        return []


class ActionShowLocationOnMap(Action):
    def name(self) -> Text:
        return "action_show_location_on_map"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        location = tracker.get_slot("location_name") or _get_entity_value(tracker, "location")
        if not location:
            dispatcher.utter_message(response="utter_ask_location")
            return []

        place = _find_place(str(location))
        if not place:
            dispatcher.utter_message(
                text=f"No encontré el lugar \"{location}\" en el mapa del campus. ¿Puedes darme más detalles?"
            )
            return []

        dispatcher.utter_message(
            text=f"Perfecto, te estoy mostrando {place.get('name')} en el mapa 📍",
            metadata={
                "action": "navigate_to_map",
                "success": True,
                "placeId": place.get("id"),
                "placeName": place.get("name"),
                "placeType": place.get("type"),
                "coordinates": place.get("coord"),
            },
        )
        return [SlotSet("location_name", str(location))]


class ActionHumanContact(Action):
    def name(self) -> Text:
        return "action_human_contact"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        dispatcher.utter_message(response="utter_human_contact")
        return []


# Backward-compatible alias used by existing flows
class ActionFetchAcademicMaterials(ActionGetSubjectMaterial):
    def name(self) -> Text:
        return "action_fetch_academic_materials"
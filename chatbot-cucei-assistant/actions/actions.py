from __future__ import annotations

from dataclasses import dataclass
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
    code: str
    names: Tuple[str, ...]
    material_file: str
    study_plan_file: str


def _load_subject_index() -> Tuple[List[SubjectEntry], Dict[str, SubjectEntry]]:
    if not os.path.exists(SUBJECTS_JSON_PATH):
        return [], {}

    with open(SUBJECTS_JSON_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    entries: List[SubjectEntry] = []
    name_index: Dict[str, SubjectEntry] = {}

    for career, subjects in raw.items():
        for key, subject in subjects.items():
            names = tuple(subject.get("names", []) or [])
            files = subject.get("files", {}) or {}
            entry = SubjectEntry(
                key=key,
                career=subject.get("career", career),
                code=subject.get("code", ""),
                names=names,
                material_file=files.get("material", ""),
                study_plan_file=files.get("study_plan", ""),
            )
            entries.append(entry)
            for n in names:
                name_index[_normalize(n)] = entry

    return entries, name_index


def _load_places() -> List[Dict[str, Any]]:
    if not os.path.exists(PLACES_JSON_PATH):
        return []
    with open(PLACES_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


SUBJECTS, SUBJECT_BY_NAME = _load_subject_index()
PLACES = _load_places()


def _find_subject(query: str) -> Optional[SubjectEntry]:
    normalized = _normalize(query)
    if not normalized:
        return None

    exact = SUBJECT_BY_NAME.get(normalized)
    if exact:
        return exact

    # Fuzzy contains match over known names
    for candidate_norm, entry in SUBJECT_BY_NAME.items():
        if normalized in candidate_norm or candidate_norm in normalized:
            return entry
    return None


def _build_material_url(entry: SubjectEntry) -> str:
    # Mirrors server/src/services/subjects.service.js
    return f"{SERVER_BASE_URL}/files/material/{entry.material_file}"


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
        if not topic:
            dispatcher.utter_message(response="utter_ask_topic")
            return []

        entry = _find_subject(str(topic))
        if not entry or not entry.material_file:
            dispatcher.utter_message(response="utter_material_not_found")
            return []

        url = _build_material_url(entry)
        dispatcher.utter_message(
            text=f"Aquí encontrarás el material de {entry.names[0] if entry.names else topic}: {url}",
            metadata={
                "subject": entry.names[0] if entry.names else str(topic),
                "code": entry.code,
                "file": entry.material_file,
                "path": url,
            },
        )
        return [SlotSet("topic", str(topic))]


class ActionGetSubjectStudyPlan(Action):
    def name(self) -> Text:
        return "action_get_subject_study_plan"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        topic = tracker.get_slot("topic") or _get_entity_value(tracker, "subject")
        if not topic:
            dispatcher.utter_message(response="utter_ask_topic")
            return []

        entry = _find_subject(str(topic))
        if not entry or not entry.study_plan_file:
            dispatcher.utter_message(response="utter_study_plan_not_found")
            return []

        url = _build_study_plan_url(entry)
        dispatcher.utter_message(
            text=f"Aquí encontrarás el plan de estudios de {entry.names[0] if entry.names else topic}: {url}",
            metadata={
                "subject": entry.names[0] if entry.names else str(topic),
                "code": entry.code,
                "file": entry.study_plan_file,
                "path": url,
            },
        )
        return [SlotSet("topic", str(topic))]


class ActionGetSubjects(Action):
    def name(self) -> Text:
        return "action_get_subjects"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        if not SUBJECTS:
            dispatcher.utter_message(text="No tengo materias cargadas en este momento.")
            return []

        sample = []
        for entry in SUBJECTS[:15]:
            if entry.names:
                sample.append(entry.names[0])

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
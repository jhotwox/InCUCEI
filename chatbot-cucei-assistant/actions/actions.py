from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import sqlite3

class ActionFetchAcademicMaterials(Action):
    def name(self) -> Text:
        return "action_fetch_academic_materials"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        topic = tracker.get_slot("topic")
        conn = sqlite3.connect("academico.db")
        cursor = conn.cursor()
        cursor.execute("SELECT recurso FROM materiales WHERE materia = ?", (topic,))
        result = cursor.fetchone()
        conn.close()

        if result:
            dispatcher.utter_message(text=f"Encontré material de {topic}: {result[0]}")
        else:
            dispatcher.utter_message(text=f"No encontré material de {topic}.")
        return []

class ActionFetchCoordinationInfo(Action):
    def name(self) -> Text:
        return "action_fetch_coordination_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        career = tracker.get_slot("career")
        conn = sqlite3.connect("academico.db")
        cursor = conn.cursor()
        cursor.execute("SELECT info FROM coordinaciones WHERE carrera = ?", (career,))
        result = cursor.fetchone()
        conn.close()

        if result:
            dispatcher.utter_message(text=f"Coordinación de {career}: {result[0]}")
        else:
            dispatcher.utter_message(text=f"No encontré información de la coordinación de {career}.")
        return []

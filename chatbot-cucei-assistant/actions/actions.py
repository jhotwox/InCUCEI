from typing import Any, Dict, List, Text
import requests

from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher


class ActionFetchAcademicMaterials(Action):
    def name(self) -> Text:
        return "action_fetch_academic_materials"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        material_type = tracker.get_slot("material_type")
        response = requests.get(f"http://192.168.100.32:3000/materials?type={material_type}")

        if response.status_code == 200:
            materials = response.json()
            if materials:
                dispatcher.utter_message(text=f"Aquí esta el material para {material_type}:")
                for material in materials:
                    dispatcher.utter_message(text=f"- {material['title']}: {material['url']}")
            else:
                dispatcher.utter_message(text=f"No se encontro material para {material_type}.")
        else:
            dispatcher.utter_message(text="Lo siento, no logre obtener material en este momento.")

        return []
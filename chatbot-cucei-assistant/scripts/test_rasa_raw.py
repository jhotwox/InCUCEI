import requests
import json

def run_tests():
    sender_id = "test_user_124"
    rasa_url = "http://localhost:5005"
    
    # Set slots first
    events = [
        {"event": "slot", "name": "user_name", "value": "Juan Perez"},
        {"event": "slot", "name": "first_name", "value": "Juan"},
        {"event": "slot", "name": "career_code", "value": "INNI"}
    ]
    try:
        requests.post(f"{rasa_url}/conversations/{sender_id}/tracker/events", json=events)
        
        # Test location
        print("Testing location query...")
        resp = requests.post(f"{rasa_url}/webhooks/rest/webhook", json={
            "sender": sender_id,
            "message": "En dónde se encuentra el Matute?"
        })
        print("Location Test Result:")
        print(json.dumps(resp.json(), indent=2))
        
        # Test name knowledge
        print("\nTesting name query...")
        resp = requests.post(f"{rasa_url}/webhooks/rest/webhook", json={
            "sender": sender_id,
            "message": "Como me llamo?"
        })
        print("Name Test Result:")
        print(json.dumps(resp.json(), indent=2))
    except Exception as e:
        print(f"Error connecting to Rasa: {e}. Is Rasa running at {rasa_url}?")

if __name__ == "__main__":
    run_tests()

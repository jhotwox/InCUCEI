# Chatbot CUCEI Assistant

This project contains a Rasa (Python) assistant for CUCEI.

It implements the same *capabilities* currently exposed by the Gemini-powered assistant in the main InCUCEI backend:
- Provide study material links for a subject
- Provide study plan links for a subject
- List available subjects
- Find a CUCEI location and return a navigation metadata payload (`action: navigate_to_map`)

This is not a “fake” demo: the Rasa assistant resolves subjects/locations using local catalogs generated from the same data used by the Node backend.

## Project Structure

```
chatbot-cucei-assistant
├── actions
│   └── actions.py           # Rasa actions implementing CUCEI functions
├── data
│   ├── flows.yml            # Conversation flows (Rasa Pro)
│   ├── nlu.yml              # Intents/examples
│   ├── rules.yml            # Rules (works without flows)
│   ├── subjects.json        # Subjects catalog (generated from server data)
│   └── places.json          # Places catalog (generated from server data)
├── models
│   └── DATE.name.tar.gz     # Trained models
├── config.yml               # Configuration settings for the Rasa chatbot
├── credentials.yml          # Credentials for messaging or voice platforms
├── domain.yml               # Slots, responses, and intents for the Rasa chatbot
├── endpoints.yml            # Endpoints for the Rasa chatbot
├── package.json             # npm configuration file
├── tsconfig.json            # TypeScript configuration file
└── README.md                # Documentation for the project
```

## Setup Instructions

1. **Install pyenv or python 3.11.9**:

2. **Create a venv with python 3.11.9**:

2.1. **Using pyenv**
   ```
   pyenv local 3.11.9
   python -m venv venv
   ```
2.2. **Using python installation**
   ``` 
   /path/to/python3.11.9 -m venv venv
   ```

3. **Activate venv**:
   ```
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

5. **Export license key into the shell**:
   ```
   export RASA_PRO_LICENSE=<Rasa_license from the .env>
   ```

6. **Train**:
   ```
   rasa train
   ```

7. **Run (two terminals)**:
   - Terminal A (actions server):
     ```
     rasa run actions --port 5055
     ```
   - Terminal B (Servidor principal / rest):
     ```
     rasa run --enable-api --cors "*" --port 5005
     ```
   - Terminal C opcional (Hablar directamente con rasa):
     ```
     rasa shell
     ```

    Notes:
    - The action server listens on `http://localhost:5055` and is used via `POST /webhook`.
    - If you open `http://localhost:5055/` in a browser you'll typically see 404 logs; that's expected.
    - Health check (if enabled by your Rasa SDK version): `curl http://localhost:5055/health`

8. **Debug/inspect (optional)**:
   ```
   rasa inspect
   ```

## Environment

The actions build file links using `INCUCEI_SERVER_BASE_URL`.

Example:
```bash
export INCUCEI_SERVER_BASE_URL=http://192.168.100.32:3000
```

## Notes

- `data/subjects.json` and `data/places.json` are generated from the monorepo server sources.
- Map navigation is returned as message metadata (compatible with clients that read custom payloads).

## Usage Guidelines

- The chatbot can assist users in finding academic materials by querying the Express backend.
- Users can request specific materials by providing details as the topic.
- The chatbot will respond with links to download the requested PDF materials.

- The chatbot can assist users in finding the location of building, department, etc.

- The chatbot can assist users in getting contact information from departments.


## AI flow:
### 1. General
1.1 Get message, type and botType del req.body
1.2 optionally get userId from req.body
1.3 Generate io interface (socket.io)
1.4 Send chatbotTyping to user
1.5 Generate conversation ID: `user_${userId}_chatbot`

### 2. Rasa
2.1 Get user (from db) to send slots (name, career) to Rasa
2.2 Send message via post to Rasa using Rasa.service (own)
2.3 Check response and search metadata.actions like navigate_to_map
2.4 Save received metadata
2.5 Sync career in case is empty or different

### 3. Gemini
> Not relevant

### 4. Post-General
4.1 Save ChatBotMessage on DB
4.2 If navigationAction exist, send it to user via io
4.3 Send ChatBotMessage to user via io
4.4 response post request

Archivos principales de la IA:
- nlu.yml
- flows.yml
- domain.yml
- actions.py

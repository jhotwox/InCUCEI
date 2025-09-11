# Chatbot CUCEI Assistant

This project is an academic assistant chatbot for CUCEI university, designed to help students and faculty access academic materials through an Express backend.
Also help students and academics to find some locations in the app map.
Finally help students and academics giving them contact information from departments. 

## Project Structure

```
chatbot-cucei-assistant
├── actions
│   └── actions.py           # Rasa action classes for chatbot functionality
├── data
│   ├── flows.yml            # Conversation flows for the chatbot
│   └── patterns.yml         # Patterns for handling user interactions
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
    $env:RASA_PRO_LICENSE = "TOKEN"
   ```

6. **Train**:
   ```
   rasa train
   ```

7. **Use in localhost**:
   ```
   rasa inspect
   ```

## Usage Guidelines

- The chatbot can assist users in finding academic materials by querying the Express backend.
- Users can request specific materials by providing details as the topic.
- The chatbot will respond with links to download the requested PDF materials.

- The chatbot can assist users in finding the location of building, department, etc.

- The chatbot can assist users in getting contact information from departments.
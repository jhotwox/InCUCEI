#!/bin/bash

if [ "$SERVICE_TYPE" = "actions" ]; then
    echo "Starting Rasa Action Server..."
    python -m rasa_sdk --actions actions --port ${PORT:-5055}
else
    echo "Starting Rasa Core Server..."
    # Train if no models found (optional, can be slow on startup)
    if [ -z "$(ls -A models)" ]; then
        echo "No models found, training..."
        rasa train
    fi
    rasa run --enable-api --cors "*" --port ${PORT:-5005}
fi

## MONGO
MONGO CONNECTION: mongodb://admin:admin123@localhost:27017

``` BASH
mongosh "mongodb+srv://incucei.ldif0fo.mongodb.net/" --apiVersion 1 --username <username> --password <password>
```

``` BASH  
use InCUCEI
db.chatbot.insertOne( { x: 1 } );
```

## PYTHON

CREATE VENV
``` BASH
python -m venv venv
SOURCE venv/bin/activate
```

PYENV
``` BASH
pyenv global 3.11.9
```

DEACTIVATE VENV
``` BASH
deactivate
```

### CHATBOT

TRAIN
``` BASH
rasa train
```

USE
``` BASH
rasa inspect
```

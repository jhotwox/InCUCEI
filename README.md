## MONGO

### Mongo with docker (don't use)
``` BASH
MONGO CONNECTION: mongodb://admin:admin123@localhost:27017
```

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

EN EL README DEL CHATBOT
Carpeta chatbot solo es un tutorial
Carpeta chatbot-cucei-assistant es el de verdad 


## TODO LIST
### FRONT
- [ ] focus en el input incompleto cuando presionas el boton de iniciar sesion o registrar
- [ ] Crear mapa
- [ ] Dar funcionalidad al mapa
- [ ] Crear chatbot
- [ ] Conectar el chatbot
- [ ] Crear sistema de ventas
- [ ] Crear chat entre usuario y vendedor
- [ ] Comunicar la ubicacion del vendedor con el mapa

### CHATBOT
- [ ] Arreglar que casi siempre termina con utter_can_do_something_else y variar la respuesta de este utter
- [ ] Pasar URL por .env o alguna solucion
- [ ] Hacer que entregue material conectandose al backend
- [ ] Agregar informacion de contacto real para cada departamento, division, etc
- [ ] Limitar lo que dice que es capas de hacer cuando preguntas quien es


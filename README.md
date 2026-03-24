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

---

## Lista de contextos
- `contexts/Snackbar.context.jsx`: Manejo de notificaciones tipo snackbar.
- `contexts/Auth.context.jsx`: Manejo de autenticación y estado del usuario.
- `contexts/Socket.context.jsx`: Conexión y manejo de Socket.IO.

---

## Contacto y Recursos
- Documentación técnica: consultar los archivos README.md y los esquemas en `/server/src/schemas/`.
- Para dudas sobre integración de Gemini, revisar `/server/src/services/gemini.service.js`.
- Para nuevas funcionalidades, seguir la arquitectura modular y aprovechar los contextos y hooks existentes.


# OUTDATED (THE CHATBOT IS NO LONGER IN PYTHON — IT'S NOW A JS BACKEND)

### CHATBOT

EN EL README DEL CHATBOT
Carpeta chatbot solo es un tutorial
Carpeta chatbot-cucei-assistant es el de verdad 


## TODO LIST
### FRONT
- [ ] focus en el input incompleto cuando presionas el boton de iniciar sesion o registrar
- [x] Crear mapa
- [x] Dar funcionalidad al mapa
- [x] Crear chatbot
- [x] Conectar el chatbot
- [x] Crear sistema de ventas
- [x] Crear chat entre usuario y vendedor
- [ ] Comunicar la ubicacion del vendedor con el mapa

### CHATBOT
- [ ] Arreglar que casi siempre termina con utter_can_do_something_else y variar la respuesta de este utter
- [ ] Pasar URL por .env o alguna solucion
- [ ] Hacer que entregue material conectandose al backend
- [ ] Agregar informacion de contacto real para cada departamento, division, etc
- [ ] Limitar lo que dice que es capas de hacer cuando preguntas quien es

## Instalación del proyecto
``` BASH
git clone https://github.com/jhotwox/InCUCEI
```

#### Mover el archivo .env del cliente dentro de la carpeta `client` y cambiar los siguientes valores del archivo:
- Cambiar correo electronico por el propio
- Cambiar contraseña por la propia
- Cambiar la IP de `EXPO_PUBLIC_SERVER_IP` por la IP de tu maquina

##### Para ver la IP en windows, dentro de la terminal escribir el siguiente comando:
``` PS
ipconfig
```

#### Mover el archivo .env del server dentro de la carpeta `server`

> Abrir proyecto en visual studio code
>
> Crear dos terminales (puede ser dentro de visual studio code), en la primera de ellas escribir:
``` BASH
cd client
npm i
npx expo start
```

> En la segunda de ellas escribir:
``` BASH
cd server
npm i
npm run dev
```

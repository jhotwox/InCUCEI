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

## Contacto y Recursos
- Documentación técnica: consultar los archivos README.md y los esquemas en `/server/src/schemas/`.
- Para dudas sobre integración de Gemini, revisar `/server/src/services/gemini.service.js`.
- Para nuevas funcionalidades, seguir la arquitectura modular y aprovechar los contextos y hooks existentes.


# OUTDATED (THE CHATBOT IS NO LONGER IN PYTHON — IT'S NOW A JS BACKEND)

### CHATBOT

EN EL README DEL CHATBOT
Carpeta chatbot solo es un tutorial
Carpeta chatbot-cucei-assistant es el de verdad 


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

---
## Actualizar proyecto
> En la rama main
``` BASH
git fetch origin
```

``` BASH
git pull origin main
```

## Instalación de la APP en dispositivos moviles
### Desarrollo
> En caso de ser necesario recrear android e ios
``` BASH
npx expo prebuild --clean
```

> Crear apk desarrollo e instalar al dispositivo conectado
``` BASH
npx expo run:android
```

El resultado esta disponible en la siguiente ruta:
`/client/android/app/build/outputs/apk/debug/app-debug.apk`

### Producción
> En caso de ser necesario recrear android e ios
``` BASH
npx expo prebuild --clean
```

> Crear APK producción para verlo en EAS dashboard
``` BASH
eas build --profile production --platform android
```
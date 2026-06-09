<div align="center">
  <img style="width: 50%" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/client/assets/icon.png"/>
  <h1><span style=color:#00695C>In</span><span style=color:#f79303>CUCEI</span></h1>

![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo)
![NodeJS](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=f5f5f5)
![MongoDB](https://img.shields.io/badge/MongoDB-FFF?logo=mongodb)
![Rasa](https://img.shields.io/badge/Rasa-5A17EE)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?logo=mapbox)
</div>

## Overview
**InCUCEI** is a mobile application designed for CUCEI (Universidad de Guadalajara) students that centralizes academic information, campus services, and student commerce into a single platform.

The app includes an AI-powered academic assistant, an interactive 2.5D campus map, and a student marketplace.

<details>
<summary>Table of Contents</summary>

- [📚 Features](#features)
- [🧰 Tech Stack](#tech-stack)
- [⚙️ Installation](#installation)
- [▶️ Usage](#usage)
- [📱 Interface](#interface)
- [🏛️ Architecture](#architecture)
- [👥 Contributors](#contributors)

</details>

## Features
### 🤖 Academic Assistant
- Search CUCEI dependencies and contact information 
- Access to degree plan
- Get study plan from your subjects
- Search academic resources using Google Scholar
- Locate university facilities directly on the map 

### 🗺️ Interactive Map
- 2.5D map rendering using building extrusion
- Indexed search for modules, bathrooms and dependencies
- Realtime geolocation

### 🏪 Student Marketplace
- Create and manage your business
- Browse student-owned stores
- Realtime student-business chat 


## Tech Stack
### Mobile App
- React Native
- Expo
- React Native Paper 
- React Native Reanimated

### Backend
- Node.js
- Express.js
- MongoDB

### AI Assistant
- Rasa Pro
- Gemini API

### Maps & Geolocation 
- Mapbox GL
- Expo Location

### DevOps / Tools
- Docker
- Python 3.11.9

## Installation
<a href="https://github.com/jhotwox/InCUCEI/releases/tag/V1.0.0">
  <img src="https://img.shields.io/badge/Android-.apk-73BA25?style=for-the-badge&logo=android" height="60" alt="Download SONE .deb package for Debian and Ubuntu" />
</a>

---
### 1. Clone repository Git
``` BASH
git clone https://github.com/jhotwox/InCUCEI && cd InCUCEI
```
### 2. Client setup
**Install packages**
``` BASH
cd client
npm i
```

**Run app**
``` BASH
npx expo run:android
```

### 3. Backend setup
**Install packages**
``` BASH
cd server
npm i
```

**Run server**
``` BASH
npm run dev
```

### 4. Rasa setup
Select python version (recommended 3.11.9)
>With PYENV
``` BASH
pyenv local 3.11.9
```

**Create venv**
``` BASH
python -m venv venv
```
**Activate environment**
>Linux
``` BASH
SOURCE venv/bin/activate
```
>Windows
``` BASH
venv\Scripts\activate
```

**Install dependencies**
```
pip install -r requirements.txt
```
**Export license key**
>Linux
```
export RASA_PRO_LICENSE=<Rasa_license>
```
>Windows
```
set RASA_PRO_LICENSE=<Rasa_license>
```
**Train model**
```
rasa train
```

**Run AI model (Requires two running servers)**

Terminal A (actions server)
```
rasa run actions --port 5055
```

Terminal B (core server)
```
rasa run --enable-api --cors "*" --port 5005
```
> or this to talk directly from the web browser
```
rasa inspect
```

## Usage
1. Lauch the app using develop build or expo Go (Maps do not work with Expo Go because need native dependencies)
2. Create an account using an institutional email
3. Chat with the academic assistant, navigate through the interactive map or talk with a student commerce

## Interface
<div align="center">
  <h3>Login / Register</h3>
  <div style="display: flex;">
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/login.png"/>
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/register.png"/>
  </div>
  <h3>Academic Assistant</h3>
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/AI.png"/>
  <h3>Map</h3>
  <div style="display: flex;">
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/map1.png"/>
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/map2.png"/>
  </div>
  <h3>Student Marketplace</h3>
  <div style="display: flex;">
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/commerceList.png"/>
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/myCommerce.png"/>
  </div>
  <div style="display: flex;">
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/chatList.png"/>
    <img style="width: 25%; display:block; margin: auto" src="https://raw.githubusercontent.com/jhotwox/InCUCEI/refs/heads/main/readmeAssets/chat.png"/>
  </div>
</div>

## Architecture

```text
                           ┌─────────────────────┐
                           │ Mobile App          │
                           │ React Native/Expo   │
                           └──────────┬──────────┘
                                      │
                         HTTP / WebSocket Requests
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Backend API #1  │       │ Backend API #2  │  ...  │ Backend API #N  │
│ Node.js/Express │       │ Node.js/Express │       │ Node.js/Express │
└──────┬──────────┘       └──────┬──────────┘       └──────┬──────────┘
       │                         │                         │
       └──────────────┬──────────┴──────────┬─────────────┘
                      │                     │
                      ▼                     ▼
          ┌─────────────────┐   ┌─────────────────────┐
          │ Redis Pub/Sub   │   │ MongoDB             │
          │ Socket Sync     │   │ Main Database       │
          └─────────────────┘   └─────────────────────┘
                                             │
                                             ▼
                                 ┌─────────────────────┐
                                 │ Cloudinary          │
                                 │ Media Storage       │
                                 └─────────────────────┘

                         ┌─────────────────────────────┐
                         │ Academic Assistant          │
                         └──────────┬──────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
             ┌──────────────┐            ┌────────────────┐
             │ Rasa Pro     │            │ Gemini API     │
             │ NLP / Intents│            │ Generative AI  │
             └──────────────┘            └────────────────┘
```

## Contributors

<div>
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/jhotwox">
          <img src="https://github.com/jhotwox.png" width="100px;" alt="Cristian"/>
          <br />
          <sub><b>Cristian Orozco</b></sub>
        </a>
        <br />
        Fullstack / AI
      </td>
      <td align="center">
        <a href="https://github.com/GersonIsma">
          <img src="https://github.com/GersonIsma.png" width="100px;" alt="Teammate"/>
          <br />
          <sub><b>Gerson Flores</b></sub>
        </a>
        <br />
        Map
      </td>
      <td align="center">
        <a href="https://github.com/BrandonHerrera23">
          <img src="https://github.com/BrandonHerrera23.png" width="100px;" alt="Teammate"/>
          <br />
          <sub><b>Brandon Herrera</b></sub>
        </a>
        <br />
        Student Marketplace
      </td>
    </tr>
  </table>
</div>
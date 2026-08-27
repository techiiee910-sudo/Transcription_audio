# 🎙️ LiveSpeak (Transcription_audio)

**LiveSpeak** is an ultra-fast, real-time audio transcription application built for seamless, low-latency live speech-to-text. It leverages **Deepgram's** powerful streaming API for lightning-fast transcription and a robust **WebSocket** architecture to broadcast live transcripts to multiple participants in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Deepgram](https://img.shields.io/badge/Deepgram-Transcription-FF4B4B?style=flat)

---

## ✨ Features

- **⚡ Zero-Latency Transcription**: Uses raw 16kHz audio streams piped directly into Deepgram's SDK for instant speech recognition without browser API warmup delays.
- **🤝 Real-Time Sharing**: Built on an Express/WebSocket backend. Create a room, share the link, and let anyone watch your transcript unfold live on their screen.
- **🎨 Premium 'Sunset Ivory' UI**: Features a custom, state-of-the-art UI with responsive glassmorphism, dynamic audio wave visualizers, and a soft, eye-friendly warm color palette.
- **📱 Fully Responsive**: Optimized for both desktop and mobile, with intelligent layout collapsing for the best user experience on any device.
- **🛡️ Robust Audio Handling**: Custom backend buffer system ensures no audio data is lost while socket connections initialize.

---

## 🏗️ Architecture

The project is structured as a robust monorepo:

- **`/frontend`**: A lightning-fast **React 19** SPA built with **Vite**, **TailwindCSS**, and **Tanstack Router**. 
- **`/backend`**: A scalable **Node.js** server handling WebSocket connections, room orchestration, and secure, direct communication with the Deepgram API.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- A [Deepgram API Key](https://deepgram.com/) for transcription.

### 1. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3001
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

Start the backend server:
```bash
npm run dev
```

### 2. Setup the Frontend

Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_WS_URL=ws://localhost:3001
```

Start the frontend server:
```bash
npm run dev
```

### 3. Start Transcribing
Navigate to `http://localhost:5173/` in your browser. Click **Start Conversation**, grant microphone permissions, and watch your speech transcribe in real-time!

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS v4, Tanstack Router, Vite.
- **Backend:** Node.js, Express, `ws` (WebSockets).
- **Speech-to-Text:** Deepgram Node SDK.

## 📝 License
This project is open-source and available under the MIT License.

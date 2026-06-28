<div align="center">
  <br/>
  <h1>🎬 Subtitr</h1>
  <p><strong>AI-Powered Subtitle Generator</strong></p>
  <p>Uzbek & multilingual transcription with word-level timestamps</p>
  <br/>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18"/>
    <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite 5"/>
    <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express 4"/>
    <img src="https://img.shields.io/badge/Gemini_2.0_Flash-8E75B2?logo=google&logoColor=white" alt="Gemini 2.0 Flash"/>
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white" alt="Framer Motion"/>
  </p>

  <br/>
</div>

## ✨ Features

- **🎯 AI Transcription** — Google Gemini 2.0 Flash for high-quality Uzbek & multilingual transcription (falls back to Whisper if needed)
- **⏱️ Word-Level Timestamps** — every word is timestamped for precise subtitle editing
- **🎨 8+ Preset Styles** — TikTok, YouTube, Instagram, Cinema, Minimal, CapCut, Bold, Classic
- **✏️ Visual Editor** — drag, resize, split, merge subtitles with real-time preview
- **▶️ Integrated Player** — video preview with subtitle overlay synced to timeline
- **💾 Multiple Export Formats** — SRT, VTT, TXT, ASS
- **🔥 Burn-In** — permanently burn subtitles into video
- **🎬 Animations** — fade, pop, scale, slide, typewriter, kinetic typography & more
- **🌙 Dark Theme** — sleek glassmorphism UI with smooth animations

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, Framer Motion, Zustand, Radix UI |
| **Backend** | Node.js, Express 4, TypeScript |
| **AI** | Google Gemini 2.0 Flash (primary), Whisper (fallback) |
| **Media** | FFmpeg, fluent-ffmpeg |

## 🛠️ Getting Started

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/subtitr.git
cd subtitr

# 2. Install dependencies
npm run install:all

# 3. Set up API keys
cp .env.example backend/.env
# Edit backend/.env — add your GEMINI_API_KEY (recommended)
# or optionally set OPENAI_API_KEY

# 4. Start development
npm run dev
```

> **Note:** First run downloads a ~150MB Whisper model for fallback transcription.

## 🧩 Architecture

```
subtitr/
├── backend/                # Express API server (:3001)
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI, FFmpeg, SSE progress
│   │   └── types/          # TypeScript types
│   └── uploads/            # Uploaded videos
├── frontend/               # Vite + React app (:5173)
│   └── src/
│       ├── components/     # UI components
│       │   ├── editor/     # Video player, timeline
│       │   ├── subtitle/   # Subtitle list & editor
│       │   ├── settings/   # Style & preset panels
│       │   ├── export/     # Export & burn-in
│       │   └── ui/         # Shared UI primitives
│       ├── pages/          # HomePage, EditorPage
│       ├── store/          # Zustand state
│       └── utils/          # API client, helpers
└── package.json            # Monorepo scripts
```

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload video file |
| `POST` | `/api/transcribe/:id` | Start transcription |
| `GET` | `/api/transcribe/:id/progress` | SSE progress stream |
| `GET` | `/api/project/:id` | Get project data |
| `PUT` | `/api/project/:id/subtitles` | Update subtitles |
| `PUT` | `/api/project/:id/style` | Update style |
| `GET` | `/api/export/:id/:format` | Export subtitles (srt/vtt/txt/ass) |
| `POST` | `/api/burn/:id` | Burn subtitles into video |
| `GET` | `/api/presets` | Get style presets |
| `GET` | `/api/video/:id` | Stream video |

## 🎨 Preset Styles

Subtitr comes with 8 professionally designed presets:

| Preset | Best For |
|--------|----------|
| **TikTok** | Bold, centered text with pop animation |
| **YouTube** | Clean Roboto subtitles |
| **Instagram** | Large, rounded, Instagram-like style |
| **CapCut** | Modern Poppins style |
| **Cinema** | Elegant serif for movies |
| **Minimal** | Clean, transparent, lightweight |
| **Bold** | Heavy emphasis, large size |
| **Classic** | Standard readable subtitles |

## 🤝 Contributing

Built as a demonstration project. Feel free to fork, extend, and make it your own!

---

<div align="center">
  <p>Made with ❤️ for the Uzbek content creator community</p>
  <p>
    <sub>
      Built with <a href="https://deepseek.com">DeepSeek</a> ·
      Idea by developers, for developers
    </sub>
  </p>
</div>

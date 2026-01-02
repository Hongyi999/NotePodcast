# NotePodcast

A modern web application for podcast playback, AI-generated summaries, personal note management, and transcript translation. Built with React, TypeScript, and styled with Apple's design principles.

## Features

- **Podcast Playback**: Support for direct audio URLs and RSS feeds
- **AI Summaries**: Automatically generated summaries with core views, key figures, and knowledge points
- **Personal Notes**: Add, sort, and manage notes synchronized with audio playback
- **Voice Input**: Voice-to-text note input using OpenAI Whisper
- **Transcripts**: Full podcast transcripts with multi-language translation support
- **Apple-Style UI**: Clean, minimalist interface following Apple's design principles

## Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key

## Installation

1. Clone the repository:
```bash
cd NoteMyPD
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_TRANSLATION_API_KEY=optional_translation_service_key
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Usage

1. Enter an Apple Podcasts URL or RSS feed URL on the home page
2. Wait for the podcast to load
3. Use the audio player to control playback
4. Browse AI-generated summaries in the left column
5. Add personal notes in the right column
6. View and translate transcripts
7. Explore audience comments (UI ready, API integration pending)

### Supported URL Types

- **Apple Podcasts URLs** (Recommended): `https://podcasts.apple.com/cn/podcast/岩中花述/id1582119137?i=1000743243063`
- **Direct RSS Feed URLs**: `https://feeds.example.com/podcast.rss`
- **Direct Audio File URLs**: `https://example.com/episode.mp3`

See [PODCAST_URL_GUIDE.md](./PODCAST_URL_GUIDE.md) for detailed information about finding and using podcast URLs.

## Browser Support

- Chrome (recommended)
- Safari (tested and optimized)
- Edge
- Firefox

## Responsive Design

- Primary: 1920x1080
- Compatible: 1366x768 and above
- Mobile-friendly layouts for smaller screens

## Project Structure

```
src/
├── components/      # React components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API and service integrations
├── styles/         # Global styles and CSS
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## License

MIT


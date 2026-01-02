# Release Notes - v0.1.0

**Release Date**: 2024-12-19  
**Status**: Stable Release

## 🎉 Initial Release

This is the first stable release of NotePodcast, a modern web application for podcast playback, AI-generated summaries, and personal note management.

## ✨ Key Features

### Podcast Playback
- **Audio Player**: Full-featured audio player with play/pause, speed control (0.5x-2.0x), and draggable progress bar
- **Multiple URL Support**: Support for RSS feeds, Xiaoyuzhoufm.com episodes, and direct audio file URLs
- **Time Navigation**: Click on time points in summaries and notes to jump to specific moments

### AI-Powered Summaries
- **Personalized Titles**: AI-generated custom summary category titles based on podcast content (using ZhipuAI GLM-4)
- **Three Summary Tabs**: Dynamic summary tabs with personalized titles
- **Time-Stamped Items**: Key points with approximate timestamps for easy navigation

### Personal Notes
- **Add & Manage**: Create, view, and delete personal notes synchronized with audio playback
- **Sorting Options**: Sort notes by audio time or publish time (newest/oldest)
- **Voice Input**: Voice-to-text note input using Web Speech API

### Transcripts & Translation
- **Full Transcripts**: Display complete podcast transcripts
- **Multi-Language Translation**: Translate transcripts to Chinese, English, Japanese, Korean, Spanish, or French (using ZhipuAI GLM-3-turbo)
- **Language Selection**: Easy dropdown selection for target language

### Shownotes Processing
- **Intro Extraction**: Automatically extracts and displays podcast introduction (content before 【内容提要】)
- **Time-Segmented Notes**: Original podcast notes parsed into time-point segments
- **Clickable Navigation**: Click time points to jump to corresponding audio position

## 🛠 Technical Stack

- **Frontend**: React 18.2 + TypeScript
- **Build Tool**: Vite 5.0
- **Routing**: React Router v6
- **AI Service**: ZhipuAI API (GLM-4, GLM-3-turbo)
- **Storage**: localStorage for notes persistence
- **Styling**: CSS Modules with Apple-style design system

## 📋 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_ZHIPU_API_KEY=your_zhipuai_api_key_here
```

### API Keys

- **ZhipuAI API Key**: Required for AI summaries and translations
  - Get your API key from: https://open.bigmodel.cn/

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Safari
- ✅ Firefox

## ⚠️ Known Limitations

1. **Audio Transcription**: ZhipuAI does not provide audio transcription API. Transcript generation is currently disabled. You can manually add transcripts or use alternative services.

2. **Voice Input**: Uses Web Speech API, which requires:
   - Modern browser with Web Speech API support
   - Microphone permissions
   - Internet connection (for cloud-based speech recognition)

3. **CORS Restrictions**: Some podcast feeds may have CORS restrictions that prevent direct access. For these cases, use:
   - Direct RSS feed URLs
   - CORS proxy services
   - Direct audio file URLs

## 📦 Installation & Usage

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔄 Version Management

### View Current Version
```bash
cat .version
```

### Checkout This Version
```bash
git checkout v0.1.0
```

### Create Branch from This Version
```bash
git checkout -b feature-branch v0.1.0
```

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed changelog.

## 🐛 Bug Reports

If you encounter any issues, please check:
1. Browser console for error messages
2. Network tab for failed requests
3. API key configuration in `.env` file

## 🔜 Future Plans

- Audio transcription integration (alternative service)
- Enhanced error handling and retry logic
- Offline support improvements
- Additional podcast platform support
- User preferences and settings

---

**Version**: 0.1.0  
**Git Tag**: v0.1.0  
**Build Date**: 2024-12-19


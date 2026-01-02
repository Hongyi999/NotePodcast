# Version History

## v0.1.0 (2024-12-19) - Initial Release

**Status**: Stable

### Key Features
- ✅ Podcast playback with Apple-style UI
- ✅ ZhipuAI integration for AI summaries and translations
- ✅ Personal notes management with voice input
- ✅ Multi-language transcript translation
- ✅ RSS feed and podcast URL parsing
- ✅ Shownotes parsing with intro extraction

### API Integration
- **ZhipuAI**: GLM-4 for summaries, GLM-3-turbo for translations
- **API Key**: Configured via `VITE_ZHIPU_API_KEY` environment variable

### Browser Compatibility
- Chrome/Edge (recommended)
- Safari
- Firefox

### Known Issues
- Audio transcription requires alternative service (ZhipuAI doesn't provide audio API)
- Voice input requires browser Web Speech API support
- Some podcast feeds may have CORS restrictions

### Upgrade Notes
This is the initial release. No upgrade path required.

---

## Version Tags

To view all version tags:
```bash
git tag -l
```

To checkout a specific version:
```bash
git checkout v0.1.0
```

To create a new branch from a version:
```bash
git checkout -b feature-branch v0.1.0
```


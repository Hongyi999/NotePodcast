# Version History

## v0.2.0 (2026-01-11) - Authentication & UI Enhancement

**Status**: Stable

### Major Updates
- ✅ **User Authentication System**: Email verification, login/signup modals, session management
- ✅ **AI Service Expansion**: Google Gemini API integration alongside ZhipuAI
- ✅ **UI/UX Polish**: Refined homepage, optimized button sizes, enhanced animations
- ✅ **Full English Interface**: All text converted to English
- ✅ **Notes Limit System**: 5 notes for guests, unlimited for authenticated users

### New Features
- Email verification registration with 6-digit codes
- Custom authentication modals (login, signup, logout confirmation)
- Supabase integration for user management and notes storage
- Logo click navigation (return to home from podcast page)
- Enhanced loading page (removed Skip AI button)
- Mock authentication mode for development

### UI Improvements
- Compact homepage layout (620px container)
- Refined input field (48px height)
- Submit button fully embedded in input field
- Multi-layer shadow system for visual depth
- Smooth cubic-bezier transitions
- Centered modal dialogs with clear backgrounds

### Bug Fixes
- Fixed submit button overflow
- Fixed dialog positioning (centered on page)
- Removed excessive background blur
- Optimized button spacing and sizing

### API Integration
- **ZhipuAI**: GLM-4 for summaries, GLM-3-turbo for translations
- **Google Gemini**: Alternative AI provider with fallback support
- **Supabase**: Authentication and database backend

### Documentation
- RELEASE_NOTES_v0.2.0.md - Complete release notes
- GEMINI_SETUP.md - Google Gemini API setup guide
- SUPABASE_SETUP.md - Database configuration guide
- NEW_FEATURES.md - Detailed feature documentation
- UI_IMPROVEMENTS.md - UI optimization details

### Upgrade from v0.1.0
```bash
git checkout v0.2.0
npm install
# Update .env with new API keys (optional)
npm run dev
```

---

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


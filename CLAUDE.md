# CLAUDE.md - AI Assistant Guide for NotePodcast

This document provides guidance for AI assistants working on the NotePodcast project.

## Project Overview

**NotePodcast** is a project in its early development stage. The repository was initialized on January 9, 2026.

### Current State

- **Status**: Bootstrap/initialization phase
- **Code**: No implementation yet
- **Dependencies**: Not configured
- **Technology Stack**: To be determined

## Repository Structure

```
NotePodcast/
├── README.md          # Project description (minimal)
├── CLAUDE.md          # AI assistant guide (this file)
└── .git/              # Git repository metadata
```

As the project develops, this structure will be updated to reflect new directories and files.

## Development Guidelines

### Git Workflow

1. **Branch Naming**: Feature branches should follow the pattern `claude/<description>-<session-id>` when created by AI assistants
2. **Commits**: Write clear, descriptive commit messages that explain the "why" not just the "what"
3. **Main Branch**: The main branch should always be in a deployable state

### Code Style (To Be Established)

When the technology stack is chosen, the following should be configured:
- Linting configuration (ESLint, Pylint, etc.)
- Formatting configuration (Prettier, Black, etc.)
- Type checking (TypeScript, mypy, etc.)

### Testing (To Be Established)

- Unit tests should be written for all business logic
- Integration tests for API endpoints
- Test coverage goals to be determined

## Key Files and Entry Points

*To be documented as the project develops.*

## Common Tasks

### Setting Up Development Environment

*Instructions to be added once the technology stack is decided.*

### Running the Application

*Instructions to be added once implementation begins.*

### Running Tests

*Instructions to be added once testing framework is configured.*

## Architecture Decisions

*Document key architectural decisions here as they are made.*

## Dependencies

*List key dependencies and their purposes here as they are added.*

## Environment Variables

*Document required environment variables here as they are introduced.*

## API Documentation

*Document API endpoints here as they are created.*

## Troubleshooting

*Document common issues and their solutions here as they arise.*

## Notes for AI Assistants

### Before Making Changes

1. Read relevant existing code to understand context
2. Check for existing patterns and conventions in the codebase
3. Verify the change aligns with the project's architecture

### Code Quality

1. Follow existing code style and patterns
2. Keep solutions simple and focused - avoid over-engineering
3. Do not add features beyond what was requested
4. Ensure code is secure - watch for OWASP top 10 vulnerabilities

### When Adding New Features

1. Consider backward compatibility
2. Add appropriate tests
3. Update documentation as needed
4. Keep commits atomic and well-described

### Project-Specific Conventions

*Add project-specific conventions here as they emerge.*

---

*Last updated: 2026-02-05*

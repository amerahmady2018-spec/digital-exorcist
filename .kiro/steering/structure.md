# Project Structure

## Key Conventions

### Process Separation

- **Main Process** (Electron): File system operations, native APIs, application lifecycle
- **Renderer Process** (React): UI components, user interactions, visual presentation
- **IPC Communication**: All cross-process communication must use proper IPC bridges

### Naming Conventions

- Use thematic variable and function names where appropriate (e.g., `banishFile`, `summonDialog`, `hauntedState`)
- Keep comments and documentation professional and clear
- Balance creativity with code maintainability

### Safety Rules

⚠️ **CRITICAL**: File deletion safety measures

- **NEVER** implement permanent file deletion in development mode
- **ALWAYS** move files to `./graveyard_trash` folder for testing
- Implement proper confirmation dialogs before any file operations
- Log all file operations for debugging and safety auditing

## Typical Folder Organization

```
/
├── src/
│   ├── main/           # Electron main process code
│   ├── renderer/       # React renderer process code
│   ├── preload/        # Preload scripts for IPC
│   └── shared/         # Shared types and utilities
├── graveyard_trash/    # Safe deletion target for development
└── dist/               # Build output
```

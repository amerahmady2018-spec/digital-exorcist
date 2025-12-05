# Technology Stack

## Core Technologies

- **Electron**: Desktop application framework
- **React**: UI library for the renderer process
- **TypeScript**: Primary programming language
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling

## Architecture

- **Main Process**: Electron backend (Node.js environment)
- **Renderer Process**: React frontend (browser environment)
- **IPC Bridges**: Communication layer between main and renderer processes

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run test suite
npm run lint         # Run linter
npm run type-check   # TypeScript type checking
```

## Styling Guidelines

- Use Tailwind CSS utility classes for all styling
- Default to dark mode theme
- Maintain spooky aesthetic while ensuring readability and usability

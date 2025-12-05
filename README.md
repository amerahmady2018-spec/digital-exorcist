# 👻 The Digital Exorcist

> *Banish the ghosts, demons, and zombies haunting your file system*

A supernatural-themed file management application that transforms the mundane task of cleaning up your computer into an epic battle against digital entities. Built for **Kiroween 2025**.

![Digital Exorcist](src/assets/images/appicon.png)

## 🎮 Features

### Three Exorcism Modes

| Mode | Description |
|------|-------------|
| **🎯 Interactive Mode** | Full control - scan folders, review entities by category, choose to purge, ignore, or battle each group |
| **⚡ Swift Purge Tool** | Quick & efficient - scan and purge with one-click execution for experienced exorcists |
| **📖 Story Mode** | Tutorial experience with levels - learn the ropes with simulated entities (no real files affected) |

### Entity Classification System

- **👻 Ghosts** - Old, abandoned files (untouched for 6+ months)
- **😈 Demons** - Large files consuming precious storage space
- **🧟 Zombies** - Duplicate files lurking in your system

### Core Capabilities

- 🔍 **Deep Scanning** - Recursive directory analysis with real-time progress
- ⚔️ **Battle System** - Turn-based combat against file entities with attacks, defense, and special moves
- 🪦 **Safe Deletion** - Files moved to graveyard folder, never permanently deleted
- ↩️ **Undo Support** - Undo window after purge operations
- 🎵 **Atmospheric Audio** - Spooky soundtrack to set the mood
- ⌨️ **Keyboard Controls** - Full keyboard navigation (ESC to go back)

## 🖥️ Tech Stack

- **Electron** - Cross-platform desktop framework
- **React 18** - Modern UI with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast builds
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/digital-exorcist.git
cd digital-exorcist

# Install dependencies
npm install
```

### Development (Desktop App)

```bash
npm run dev
```

### Web Demo

```bash
# Build web version
npm run build:web

# Preview locally
npm run preview:web
```

### Production Build

```bash
npm run build
```

## 🌐 Live Demo

Try the web demo: [digital-exorcist.vercel.app](https://digital-exorcist.vercel.app)

> Note: The web demo uses simulated data. Download the desktop app for real file management.

## 📁 Project Structure

```
digital-exorcist/
├── src/
│   ├── main/           # Electron main process (file operations)
│   ├── renderer/       # React UI
│   │   ├── components/ # UI components
│   │   │   ├── flows/  # Screen flows (Interactive, Swift, etc.)
│   │   │   └── ui/     # Reusable UI elements
│   │   ├── hooks/      # Custom React hooks
│   │   ├── store/      # Zustand state management
│   │   └── data/       # Mock data for demos
│   ├── preload/        # Electron IPC bridge
│   └── shared/         # Shared types
└── .kiro/              # Kiro specs & steering rules
```

## 🛡️ Safety First

**All operations are non-destructive:**

- Files are moved to `./graveyard_trash`, never permanently deleted
- Full restoration available at any time from the Graveyard view
- 30-second undo window after each operation
- Whitelist protection for important files
- System folders are automatically blocked from scanning

## 🎨 Screenshots

### Title Screen
*Atmospheric entry with animated logo*

### Interactive Mode - Group Resolution
*Review and decide the fate of each entity category*

### Battle Arena
*Turn-based combat with attacks, defense, and special moves*

### Swift Purge Tool
*Quick scan and purge for efficient cleanup*

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron development |
| `npm run build` | Build desktop application |
| `npm run build:web` | Build web demo |
| `npm run preview:web` | Preview web build locally |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript validation |

## 🏆 Built for Kiroween 2025

This project was built using [Kiro](https://kiro.dev) - the AI-powered IDE that helps developers build better software faster.

### Kiro Features Used

- **Specs** - Structured feature development with requirements → design → tasks
- **Steering** - Project-wide coding standards and conventions
- **Hooks** - Automated workflows for testing and validation

## 📄 License

MIT

---

*May your files rest in peace* 🪦

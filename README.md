<div align="center">
  <img src="resources/icon.png" alt="Mira Logo" width="120" height="120">

  <h1>Mira</h1>

  <p><strong>A cross-platform screenshot and annotation tool</strong></p>

  <p>
    <em>Capture. Annotate. Share in seconds.</em>
  </p>

  <p>
    <a href="https://electronjs.org">
      <img alt="Electron" src="https://img.shields.io/badge/Electron-39-9FEAF9?style=flat-square&logo=electron">
    </a>
    <a href="https://react.dev">
      <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react">
    </a>
    <a href="https://www.typescriptlang.org">
      <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript">
    </a>
    <a href="https://pnpm.io">
      <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-F69220?style=flat-square&logo=pnpm">
    </a>
    <a href="https://codecov.io/gh/blas-works/mira">
      <img alt="Coverage" src="https://img.shields.io/codecov/c/github/blas-works/mira?style=flat-square&logo=codecov&label=coverage">
    </a>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-development">Development</a>
  </p>
</div>

---

## ✨ Features

| 📸 **Capture**            | Multi-monitor screen capture with virtual bounds support |
| :------------------------ | :------------------------------------------------------- |
|                           | Region selection with resizable handles                  |
|                           | Dimension badge showing selection size in real-time      |
|                           | Magnifier for pixel-perfect selection                    |
| 🖊️ **Annotation**         | Pen tool for freehand drawing                            |
|                           | Arrow, rectangle, and text annotations                   |
|                           | Blur tool for sensitive information                      |
|                           | Eyedropper color picker with loupe                       |
|                           | 5 preset colors and custom color support                 |
|                           | 4 font sizes for text annotations                        |
| 🔄 **History**            | Undo/redo annotation history                             |
|                           | Keyboard shortcuts for every tool                        |
| 📋 **Actions**            | Copy to clipboard in one click                           |
|                           | Save to file system                                      |
|                           | Open in editor for further editing                       |
|                           | OCR text recognition with Tesseract.js                   |
| ⚙️ **Settings**           | Launch at startup                                        |
|                           | Capture sound toggle                                     |
|                           | Magnifier toggle                                         |
|                           | OCR language selection (Spanish/English)                 |
|                           | Customizable keyboard shortcuts                          |
| 🖥️ **System Integration** | System tray with context menu                            |
|                           | Platform-specific tray icons (macOS/Windows/Linux)       |
|                           | Global shortcut for instant capture                      |
| 🔄 **Automatic Updates**  | Smart updates with priority levels                       |
|                           | GitHub Releases auto-update channel                      |
| 💾 **Local Storage**      | electron-store for persistent settings                   |
|                           | Offline-first, privacy-focused                           |

## 🚀 Installation

### Homebrew (macOS/Linux)

Install Mira via [Homebrew](https://brew.sh):

**Option 1 — Add tap first (recommended):**

```bash
brew tap blas-works/apps
brew install --cask mira
```

**Option 2 — One-liner without tap:**

```bash
brew install --cask blas-works/apps/mira
```

To upgrade to the latest version:

```bash
brew upgrade --cask mira
```

### Manual Download

Download the latest version from [GitHub Releases](https://github.com/blas-works/mira/releases/latest).

| Platform    | Architecture  | Format             |
| ----------- | ------------- | ------------------ |
| **Windows** | x64           | `.exe` (NSIS)      |
| **Linux**   | x64           | `.AppImage` `.deb` |
| **macOS**   | Apple Silicon | `.dmg` `.zip`      |

### Development

#### Prerequisites

- **Node.js** 22 or 24 LTS
- **pnpm** >= 11

#### Quick Start

```bash
# Clone the repository
git clone https://github.com/blas-works/mira.git
cd mira

# Install dependencies
pnpm install

# Run in development mode
pnpm run dev
```

<details>
<summary><b>📖 Development Scripts</b></summary>

| Command                  | Description                         |
| ------------------------ | ----------------------------------- |
| `pnpm run dev`           | Development server with hot reload  |
| `pnpm run build`         | Production build (typecheck + vite) |
| `pnpm run build:unpack`  | Build without packaging             |
| `pnpm run build:win`     | Build for Windows (.exe)            |
| `pnpm run build:mac`     | Build for macOS (.dmg, .zip)        |
| `pnpm run build:linux`   | Build for Linux (.AppImage, .deb)   |
| `pnpm run test`          | Run tests in watch mode             |
| `pnpm run test:run`      | Run tests once                      |
| `pnpm run test:coverage` | Run tests with coverage report      |
| `pnpm run lint`          | Lint code with ESLint               |
| `pnpm run typecheck`     | Type check with TypeScript          |

</details>

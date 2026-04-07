# First Project

> A production-ready React + TypeScript starter with Framer Motion animations, CSS Modules, and Vite.

---

## ✨ Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Static type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [CSS Modules](https://github.com/css-modules/css-modules) | Scoped component styles |
| [ESLint](https://eslint.org) | Code linting |
| [Prettier](https://prettier.io) | Code formatting |

---

## 📁 Project Structure

```
first-project/
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── Header/       # App header with theme toggle
│   │   ├── HeroSection/  # Landing hero section
│   │   ├── FeatureGrid/  # Feature showcase grid
│   │   ├── FeatureCard/  # Individual feature card
│   │   ├── Footer/       # App footer
│   │   └── ui/           # Reusable UI primitives
│   │       ├── Button/   # Polymorphic button component
│   │       └── Badge/    # Badge / label component
│   ├── hooks/            # Custom React hooks
│   │   ├── useMediaQuery.ts
│   │   └── useLocalStorage.ts
│   ├── utils/            # Pure utility functions
│   │   ├── cn.ts         # Class name combiner
│   │   └── formatDate.ts # Date formatter
│   ├── styles/           # Global CSS & animations
│   │   ├── global.css
│   │   └── animations.css
│   ├── types/            # Shared TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Root application component
│   ├── App.module.css
│   ├── main.tsx          # React DOM entry point
│   └── vite-env.d.ts     # Vite & CSS Module type declarations
├── .eslintrc.cjs         # ESLint configuration
├── .gitignore
├── .prettierrc           # Prettier configuration
├── index.html            # HTML entry point
├── package.json
├── tsconfig.json         # TypeScript (app)
├── tsconfig.node.json    # TypeScript (Vite config)
└── vite.config.ts        # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- npm, pnpm, or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (opens at http://localhost:3000)
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint all TypeScript/TSX files |
| `npm run lint:fix` | Lint and auto-fix issues |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing |

---

## 🎨 Theming

Global CSS custom properties are defined in `src/styles/global.css`. A dark theme override is applied via a `.dark` class on the root wrapper in `App.module.css`. Toggle it with the 🌙 button in the header.

---

## 📐 Path Aliases

Import from `src/` using the `@/` alias — configured in both Vite and TypeScript:

```ts
import { Button } from '@/components/ui/Button/Button';
import { cn }     from '@/utils/cn';
```

---

## 🏗️ Building for Production

```bash
npm run build
```

Output is placed in the `dist/` directory with sourcemaps included. Preview the build with `npm run preview`.

---

## 📄 License

MIT

# GM Escalade 2-Mode Hybrid Expert

دليل الصيانة التفاعلي والتشخيص الذكي لكاديلاك إسكاليد هايبرد 2010 ونظام 2-Mode Hybrid من جنرال موتورز.

## Features

- **2-Mode Hybrid Diagnostics**: Comprehensive lookup table and fuzzy search for GM 2-Mode Hybrid DTC trouble codes (P0A80, P0AC4, P0A7F, P0C05, etc.).
- **Automatic DTC Detection**: Detects trouble codes in natural language queries and displays color-coded diagnostic cards with system info and root causes.
- **Decision Engine**: High-confidence decision cards, verified technical sources, and knowledge base tracking.
- **Local AI Provider Support**: Direct integration with local Antigravity CLI and Codex CLI for local, private diagnostics without external API dependencies.
- **Full Test Suite**: Tested with Vitest and React Testing Library (>94% coverage).

## Development

Prerequisites: Node.js (>=20) and npm.

```sh
git clone https://github.com/IbrahimQassem/gm-escalade-expert.git
cd gm-escalade-expert
npm install
npm run dev
```

## Testing & Quality Gates

```sh
npm test              # Run all Vitest unit & component tests
npm run test:coverage # Generate coverage report
npm run build         # Production SSR build
```

## Local AI Integration (Antigravity CLI / Codex CLI)

The chat server runs an authenticated CLI installed on the same machine.

Authenticate one or both CLIs first:

```sh
agy
codex login
```

Antigravity is the default provider:

```sh
AI_CLI_PROVIDER=antigravity npm run dev
```

To use Codex instead:

```sh
AI_CLI_PROVIDER=codex npm run dev
```

## Tech Stack

- TanStack Start & TanStack Router
- React 19 & TypeScript
- Tailwind CSS & Lucide Icons
- Nitro & Vite
- Vitest & Testing Library

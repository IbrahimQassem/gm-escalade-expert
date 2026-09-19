# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Local AI with Antigravity CLI or Codex CLI

The chat server runs an authenticated CLI installed on the same machine. No
`LOVABLE_API_KEY` is required.

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

The server launches the selected CLI without a shell. Antigravity runs with its
terminal sandbox enabled, and Codex runs in read-only mode. This integration is
intended for local development on a trusted machine; a hosted deployment will
not have access to your local CLI credentials. Production builds target a Node.js
server because browser and edge runtimes cannot launch local CLI processes.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

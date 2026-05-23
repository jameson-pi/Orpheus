# AI Agent Instructions for Orpheus AI

This codebase is a Next.js App Router application integrated with Firebase Genkit and an OpenAI-compatible AI Proxy. 

## Architectural Patterns

- **Server Actions for AI Flows**: AI flows are exposed as Next.js Server Actions. Always include `'use server';` at the top of flow definitions (e.g., `src/ai/flows/orpheus-ai-chat-interaction.ts`).
- **AI Proxy Integration**: Do not use standard Genkit model plugins. Instead, instantiate the standard `openai` SDK with your API key and the proxy URL. Wrap this logic inside `ai.defineFlow` (see `src/ai/flows/orpheus-ai-chat-interaction.ts`).
- **Client/Server Boundary**: Client components (`"use client"`) like `src/components/chat/chat-interface.tsx` import and invoke the Server Action flows directly.

## Developer Workflows

This project requires running both the Next.js server and the Genkit flows during development.
- **Frontend Server**: Run `npm run dev` to start the Next.js app on port 9002 with Turbopack.
- **Genkit UI**: Run `npm run genkit:dev` or `npm run genkit:watch` to start the Genkit UI and serve the typescript flows from `src/ai/dev.ts`.

## UI Conventions

- **Component Library**: Use the pre-installed Radix UI + Tailwind components located in `src/components/ui/`. Do not install new primitive UI libraries.
- **Theming**: The app uses a modern dark theme. Rely on existing utility classes like `text-orpheus-gradient` or layout classes like `bg-background` and `text-accent`.
- **Icons**: Use `lucide-react` for all iconography.

## File Structure Guidelines

- **AI Definitions**: Place new flows in `src/ai/flows/`. They must define robust input/output schemas using Zod.
- **Genkit Registration**: Ensure any new flow files are imported into `src/ai/dev.ts` to be discovered by the Genkit CLI.
- **Feature Structure**: Place specialized components (like `chat-interface.tsx` or `message-bubble.tsx`) in dedicated feature folders under `src/components/` instead of cluttering up the root or `ui/` folder.


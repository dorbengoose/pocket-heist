# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pocket Heist** is a Next.js 16 starter project for the Claude Code Masterclass. It's a full-stack React application with TypeScript, modern tooling, and component-based architecture.

## Common Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server (after build)
npm run start

# Run linter
npm run lint

# Run all tests
npm run test

# Run a specific test file
npx vitest tests/path-to-test.test.ts

# Run tests in watch mode
npx vitest --watch

# Run tests with UI
npx vitest --ui
```

## Architecture & Code Organization

### Directory Structure

- **`app/`** — Next.js 16 app router directory containing page routes and layouts
- **`components/`** — Reusable React components used across pages
- **`tests/`** — Test files using Vitest (mirror app/components structure)
- **`public/`** — Static assets

### Key Technologies

- **Next.js 16** — React framework with app router, server/client components, API routes
- **React 19** — Latest React with automatic batching and hooks
- **TypeScript** — Type-safe JavaScript with strict mode enabled
- **Tailwind CSS 4** — Utility-first CSS framework with new @apply improvements
- **Vitest** — Fast unit test runner with jsdom for DOM testing
- **Testing Library** — Component testing via user-centric queries (DOM + React)
- **ESLint** — Code quality with Next.js and TypeScript rules

### Path Aliases

`@/*` resolves to the repository root, allowing clean imports:
```typescript
import { ComponentName } from '@/components/ComponentName'
```

### Testing Setup

- **Test Environment:** jsdom (simulated DOM)
- **Test Globals:** Vitest globals enabled (describe, it, expect, etc.)
- **Setup Files:** vitest.setup.ts imports testing-library/jest-dom matchers
- **Test Discovery:** Files matching `**/*.test.ts(x)` or `**/*.spec.ts(x)` are run

Tests should use Testing Library best practices:
- Query by accessible roles/labels first (getByRole, getByLabelText)
- Avoid implementation details (queryByTestId as last resort)
- Use `userEvent` instead of `fireEvent` for user interactions

### TypeScript Configuration

- **Target:** ES2017 with esnext modules
- **Strict Mode:** Enabled (strict null checks, explicit types required)
- **JSX:** react-jsx (automatic runtime, no React import needed)
- **Module Resolution:** bundler (Next.js compatible)
- **Path aliases:** Configured for clean imports

### Code Quality Standards

- **Linting:** ESLint enforces Next.js and TypeScript best practices
- **Type Safety:** Strict TypeScript configuration throughout
- **React Best Practices:** Hooks, functional components, prop types
- **Component Testing:** Unit test components in isolation with Testing Library

## Development Workflow

1. Create components in `components/` as reusable, testable units
2. Use components in page routes within `app/`
3. Write tests alongside components in `tests/`
4. Run `npm run lint` to catch style issues early
5. Run `npm run test` before committing
6. Use `npm run dev` for iterative development with hot reload

## Helpful Notes

- Components don't need to be "use client" unless they use client hooks (useState, useEffect, etc.)
- Tailwind classes provide styling — no separate CSS files needed unless PostCSS features are required
- Keep components small and focused; extract logic into custom hooks when needed
- Tests should be readable and maintainable; optimize for clarity over brevity

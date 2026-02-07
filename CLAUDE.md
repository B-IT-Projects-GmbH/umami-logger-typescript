# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript wrapper library for [Umami Analytics](https://umami.is) that sends custom events and page views via the Umami `/api/send` endpoint. Published as `@bitprojects/umami-logger-typescript` on npm.

## Commands

- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Test:** `npm run test` (runs Jest with jsdom environment)
- **Install:** `npm install`

## Architecture

This is a small single-class library with three source files:

- `src/UmamiLogger.ts` — Core singleton class. Handles initialization with `UmamiConfig` (baseUrl, websiteId, optional hostName), builds payloads from browser globals (`window`, `navigator`, `document`), and sends them via axios POST.
- `src/index.ts` — Public API facade. Exposes `Umami` object with `initialize()`, `trackEvent()`, and `trackPageView()` methods that delegate to `UmamiLogger.getInstance()`.
- `src/UmamiLogger.test.ts` — Jest tests. Mocks axios and browser globals (window.location, screen, navigator, document).

The library uses the **singleton pattern** — `UmamiLogger.getInstance()` returns the single instance. Configuration is set via `initialize()` before any tracking calls.

## Key Details

- **Module format:** CommonJS (target ES6), with TypeScript declarations
- **Test environment:** `jest-environment-jsdom` (required because the library reads browser APIs)
- **HTTP client:** axios (the only runtime dependency)
- **CI:** GitHub Actions runs build + test on push/PR to main (Node 20)

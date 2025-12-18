# Prompt Builder

A lightweight, always-on web tool for composing clean, repeatable GitHub README prompts. Prompt Builder focuses on speed, clarity, and consistency by letting you assemble a well-structured README request using presets, rules, and optional add-ons while keeping the generated prompt visible at all times.

The UI is intentionally compact and developer-focused: configuration controls live on the left in collapsible sections, while the generated prompt and actions remain sticky and visible on the right.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup and Run Instructions](#setup-and-run-instructions)
- [Configuration](#configuration)
- [Notes and Limitations](#notes-and-limitations)

---

## Overview

Prompt Builder is a small Express-powered web app that serves a static Bootstrap-based interface. It helps you generate a single, copy-ready paragraph that you can paste directly into ChatGPT (or similar tools) to request a README for a project.

Key ideas behind the project:

- Keep the **output (prompt preview)** always visible
- Reduce clutter using **accordions** for rarely used controls
- Persist user choices automatically using **localStorage**
- Avoid opinionated fluff like badges, screenshots, or links unless explicitly requested

The app does not generate the README itself. Instead, it generates a precise, repeatable _prompt_ for generating README files.

---

## Project Structure

The project is intentionally simple. Express is used only to serve static files and provide a basic health endpoint.

```
.
├── src/
│   └── server.js
│
├── public/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── index.js
│
├── package.json
└── PROMPT-BUILDER.md
```

### Notable files

- `src/server.js`

  - Minimal Express server
  - Serves static files from `public/`
  - Exposes `/api/health` for basic checks

- `public/index.html`

  - Main UI layout
  - Two-column design with accordions and sticky preview panel

- `public/js/index.js`

  - All client-side logic
  - Prompt construction, presets, rules, and localStorage persistence

- `public/css/styles.css`

  - Minimal styling helpers
  - Monospace preview font and sticky preview tuning

---

## Setup and Run Instructions

### Prerequisites

- Node.js (18+ recommended)
- npm

### Install dependencies

```bash
npm install
```

### Run the server

```bash
npm start
```

By default, the app runs on:

```
http://localhost:3101
```

The port and host can be changed via environment variables if needed.

---

## Configuration

This project has **no required configuration files**.

Optional environment variables:

- `PORT`

  - Port the Express server listens on
  - Default: `3101`

- `HOST`

  - Network interface to bind to
  - Default: `0.0.0.0`

Example:

```bash
PORT=8080 HOST=127.0.0.1 npm start
```

All user preferences inside the UI (presets, checkboxes, notes, etc.) are stored automatically in the browser using `localStorage`.

---

## Notes and Limitations

- This tool **does not generate README files directly**. It only generates a prompt intended to be pasted into ChatGPT or a similar system.
- There is no authentication or multi-user support. It is designed for personal or local-network use.
- The server is intentionally minimal and does not persist data beyond what the browser stores locally.
- The UI is optimized for desktop use; it works on mobile, but the workflow is best on larger screens.

---

If you find yourself repeatedly writing README prompts or refining the same wording over and over, Prompt Builder turns that process into a fast, repeatable workflow.

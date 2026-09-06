# Flownix ⚡

> **Flownix** is an open-source, web-based flowchart and diagram generator inspired by Mermaid, powered by a custom lightweight, framework-agnostic diagram rendering engine built from scratch.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()

---

## 🌟 Highlights

- **Custom Diagram Engine**: Zero external dependencies on Mermaid or third-party graph rendering libraries.
- **Standalone Engine Package**: `@flownix/engine` can be consumed independently by node scripts, React, Vue, or vanilla JS applications.
- **Intuitive Text DSL Syntax**: Convert clean text statements (`A[Start] --> B[Login]`) into responsive SVG flowcharts.
- **Multiple Node Shapes**:
  - Rectangle (`A[Start]`)
  - Decision Diamond (`A{Valid Credentials?}`)
  - Circle (`A((Start Node))`)
  - Rounded Rectangle (`A(Process Step)`)
- **Interactive SVG Canvas**: Pan canvas by dragging, Zoom in (`+`) & out (`-`), Fit to screen, and click to inspect & highlight nodes.
- **Multi-Directional Layouts**: Supports `TD`/`TB` (Top to Bottom), `LR` (Left to Right), `RL` (Right to Left), and `BT` (Bottom to Top).
- **Export Capabilities**: One-click download as standalone `.svg` vector or 2x high-resolution `.png` image.
- **Full-Stack Ecosystem**:
  - `apps/web`: Live React + Vite visual editor with debounced preview (~150ms).
  - `apps/api`: Express.js + MongoDB REST API server with JWT authentication and public diagram share link creation (`/share/:shareId`).

---

## 🏗️ Architecture

Flownix parses raw text into positioning-calculated SVG diagrams through a 5-phase pipeline:

```text
Source Code (Text DSL)
         ↓
  Lexical Tokenizer        (tokenizer.js)
         ↓
  Syntax Parser            (parser.js)
         ↓
  Intermediate Graph AST   ({ direction, nodes, edges })
         ↓
  Layered Layout Engine    (layout.js)
         ↓
  Vector SVG Renderer      (renderer.js)
         ↓
  Interactive Canvas App   (React/DOM Viewport)
```

---

## 📖 DSL Syntax Guide

### Basic Flowchart
```text
flowchart TD

A[Start] --> B[Login]
B --> C{Valid Credentials?}
C -->|Yes| D[Dashboard]
C -->|No| E(Show Error)
```

### Supported Shapes & Syntaxes

| Shape Type | Syntax Code | Rendered Geometry |
| :--- | :--- | :--- |
| **Rectangle** | `A[Start]` | Rounded Rectangle (`rx="8"`) |
| **Decision Diamond** | `A{Valid?}` | Polygon Diamond (`<polygon />`) |
| **Circle Node** | `A((Start Node))` | SVG Circle (`<circle />`) |
| **Rounded Rect** | `A(Process)` | Pill Rectangle (`rx="20"`) |
| **Labeled Edge** | `A -->|Yes| B` | Curved Bezier Path with Midpoint Badge |

### Diagram Directions
- `TD` / `TB`: Top to Bottom (Default)
- `LR`: Left to Right (Horizontal)
- `RL`: Right to Left
- `BT`: Bottom to Top

---

## 📦 Usage as Standalone Engine (`@flownix/engine`)

`@flownix/engine` is completely framework-independent and can be used in any JavaScript environment:

```javascript
import { createDiagram } from '@flownix/engine';

const sourceCode = `
flowchart LR

A((Start)) --> B{Authenticated?}
B -->|Yes| C[Dashboard]
B -->|No| D(Redirect to Login)
`;

const result = createDiagram(sourceCode, {
  theme: 'dark' // 'dark' | 'light'
});

console.log(result.svg); // Clean SVG vector string markup
console.log(result.layout); // Calculated { (x, y, width, height) } for all nodes & edges
```

---

## 📁 Monorepo Layout

Flownix is structured as an NPM Workspaces monorepo:

```text
Flownix/
├── apps/
│   ├── web/                     # React + Vite frontend editor application
│   │   ├── src/
│   │   │   ├── components/      # Editor, Canvas, Toolbar, Modals, ExportMenu
│   │   │   ├── services/        # API Client service
│   │   │   └── App.jsx
│   │   └── vite.config.js
│   │
│   └── api/                     # Express.js + MongoDB REST API server
│       ├── src/
│       │   ├── models/          # User and Diagram Mongoose schemas
│       │   ├── routes/          # Auth (/api/auth), Diagrams (/api/diagrams), Share (/api/share)
│       │   ├── middleware/      # JWT protect middleware
│       │   └── server.js
│       └── package.json
│
├── packages/
│   └── flow-engine/             # Standalone @flownix/engine package
│       ├── src/
│       │   ├── tokenizer/       # Lexical analyzer
│       │   ├── parser/          # AST builder & syntax error reporter
│       │   ├── layout/          # Topological graph layer rank layout
│       │   ├── renderer/        # Theme-aware SVG generator
│       │   └── index.js
│       └── tests/               # Node test runner unit test suite
│
├── README.md
├── LICENSE
└── package.json                 # Monorepo workspaces configuration
```

---

## 🔌 REST API Endpoints (`apps/api`)

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET /api/auth/me` - Fetch profile for authenticated user (`Authorization: Bearer <token>`)

### Diagrams CRUD
- `POST /api/diagrams` - Save new diagram (`sourceCode`, `title`, `description`)
- `GET /api/diagrams` - List saved diagrams for current user
- `GET /api/diagrams/:id` - Fetch single diagram details
- `PUT /api/diagrams/:id` - Update existing diagram
- `DELETE /api/diagrams/:id` - Remove diagram

### Public Sharing
- `GET /api/share/:shareId` - Public lookup endpoint for shared diagrams

---

## 🚀 Quick Start & Development Setup

### Prerequisites
- Node.js >= 18.0.0

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/rohanhalaj18/Flownix.git
cd Flownix

# 2. Install workspace dependencies
npm install

# 3. Run unit test suite
npm test

# 4. Start the frontend web application
npm run dev

# 5. (Optional) Start the Express REST API server
npm run api
```

The web application will launch at [http://localhost:3000](http://localhost:3000) and the REST API server runs at [http://localhost:5000](http://localhost:5000).

---

## 🗺️ Roadmap & Future Enhancements

- [x] Milestone 1: Custom Tokenizer, Parser, basic layout & live SVG preview.
- [x] Milestone 2: Decision diamonds, circle nodes, rounded rects, edge labels, & multi-direction layouts.
- [x] Milestone 3: Drag panning, zoom controls, fit-to-screen, & node selection highlighting.
- [x] Milestone 4: SVG & high-res PNG file export, Express REST API, & MongoDB model schemas.
- [x] Milestone 5: Authentication UI, saved diagram dashboard, & public share link creation.
- [x] Milestone 6: Decoupled `@flownix/engine` NPM package & comprehensive open-source documentation.
- [ ] Natural Language AI diagram generation endpoint (`LLM -> Flownix DSL -> Renderer`).

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

# ChemFarm Showdown

A React application bootstrapped with Vite. The repository includes a responsive starter screen, ESLint configuration, and production build scripts.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Getting started

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal. Changes in `src/` are reflected in the browser through Fast Refresh.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run lint` | Check JavaScript and JSX with ESLint |
| `npm run preview` | Preview the production build locally |

## Project structure

```text
chemfarm-showdown/
├── src/
│   ├── App.jsx          # Main application screen
│   ├── main.jsx         # React entry point
│   └── styles.css       # Global and responsive styles
├── eslint.config.js     # ESLint flat configuration
├── index.html           # Vite HTML entry point
├── package.json         # Scripts and dependencies
└── vite.config.js       # Vite and React configuration
```

## Quality checks

Run both checks before opening a pull request:

```bash
npm run lint
npm run build
```

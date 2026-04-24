# React Migration Plan

## 1. Project Setup (Done)
- [x] Added React, ReactDOM, Vite, and Vite React plugin to dependencies
- [x] Created `src/react/` directory and initial `index.jsx`/`index.html`
- [x] Added `vite.config.js` for React + legacy support

## 2. Next Steps
- [ ] Add `vite` and `vite:preview` scripts to `package.json`
- [ ] Install `@vitejs/plugin-react` (run: `npm install @vitejs/plugin-react`)
- [ ] Test Vite dev server: `npx vite`
- [ ] Begin migrating components:
    - [ ] Navigation bar (header)
    - [ ] Composer
    - [ ] Home view
    - [ ] Visualization suite
- [ ] Integrate React Router
- [ ] Add state management (Context or Zustand)
- [ ] Remove legacy JS as React replaces it

## How to Run React Dev Server
```sh
npm install
npm install @vitejs/plugin-react
npx vite
```
Then open http://localhost:5173

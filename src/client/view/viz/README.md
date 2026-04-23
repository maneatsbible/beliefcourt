# Visualization Suite (`viz/`)

This directory contains all new visualization components for Truthbook, built fresh for mockMode-first analytics and timeline replay features.

- All legacy visualization code is to be marked for deletion in its original files.
- All new visualizations (timeline, EEO, adjacency/distance, settlements, etc.) should be implemented here as modular, composable components.
- All visualizations must work in mockMode with static data.
- D3.js is the preferred library for rendering.

## Components to Implement
- `TimelineReplayView.js` — Timeline/ledger replay visualization
- `EEOView.js` — Emergent Epistemic Organization visualization
- `AdjacencyView.js` — Worldview adjacency/distance visualization
- `SettlementView.js` — Settlement/forgiveness visualization
- `WorldviewMapView.js` — Overview of all worldviews and their relationships

## Usage
Import and mount these components from the main app or relevant views. All must support mockMode and static data injection for prototyping and demos.

---

**NOTE:** All legacy visualization code in other files must be marked for deletion at the top of the file.

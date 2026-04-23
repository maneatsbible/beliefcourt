// *** LEGACY VISUALIZATION FILES MUST BE MARKED FOR DELETION ***
// AdjacencyView.js — Worldview adjacency/distance visualization (mockMode-first)
//
// This component visualizes the adjacency/distance between worldviews.
//
// Requirements:
// - Must work in mockMode with static/mock data
// - D3.js for rendering
// - Modular, composable, and embeddable in any view
// - Accepts adjacency data as a prop
// - No backend dependencies

export class AdjacencyView {
  /**
   * @param {HTMLElement} container
   * @param {Object[]} adjacencyData - Array of worldview adjacency/distance info
   * @param {Object} [opts]
   */
  constructor(container, adjacencyData, opts = {}) {
    this._el = container;
    this._data = adjacencyData;
    this._opts = opts;
  }

  render() {
    this._el.innerHTML = '';
    // TODO: Implement D3 adjacency visualization here
    const d3root = document.createElement('div');
    d3root.className = 'viz-adjacency';
    d3root.textContent = '[AdjacencyView: D3 visualization placeholder]';
    this._el.appendChild(d3root);
  }
}

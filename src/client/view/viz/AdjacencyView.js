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

  async render() {
    this._el.innerHTML = '';
    const d3 = await (await import('./d3.js')).loadD3();
    const width = this._opts.width || 600;
    const height = this._opts.height || 600;
    const svg = d3.select(this._el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'viz-adjacency');

    // Build a matrix of distances
    const nodes = Array.from(new Set(this._data.flatMap(d => [d.source, d.target])));
    const n = nodes.length;
    const nodeIndex = Object.fromEntries(nodes.map((id, i) => [id, i]));
    const cellSize = Math.max(10, Math.floor(Math.min(width, height) / n));

    // Draw grid
    svg.selectAll('rect')
      .data(this._data)
      .join('rect')
      .attr('x', d => nodeIndex[d.source] * cellSize)
      .attr('y', d => nodeIndex[d.target] * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => d3.interpolateYlGnBu(1 - Math.min(1, d.distance)))
      .attr('stroke', '#fff')
      .append('title')
      .text(d => `From ${d.source} to ${d.target}: Distance = ${d.distance}`);

    // Axis labels
    svg.append('text')
      .attr('x', cellSize * n / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#888')
      .text('Target Worldview');
    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 14)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#888')
      .text('Source Worldview');

    // Legend
    const legendWidth = 120;
    const legendHeight = 12;
    const legend = svg.append('g')
      .attr('transform', `translate(${width - legendWidth - 20},${height - 30})`);
    for (let i = 0; i <= 10; i++) {
      legend.append('rect')
        .attr('x', i * (legendWidth / 10))
        .attr('y', 0)
        .attr('width', legendWidth / 10)
        .attr('height', legendHeight)
        .attr('fill', d3.interpolateYlGnBu(i / 10));
    }
    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 12)
      .attr('font-size', 11)
      .attr('fill', '#888')
      .text('Closer');
    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 12)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('fill', '#888')
      .text('Further');

    // Draw labels
    svg.selectAll('text.row')
      .data(nodes)
      .join('text')
      .attr('class', 'row')
      .attr('x', 0)
      .attr('y', (d, i) => i * cellSize + cellSize / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .text(d => d);
    svg.selectAll('text.col')
      .data(nodes)
      .join('text')
      .attr('class', 'col')
      .attr('x', (d, i) => i * cellSize + cellSize / 2)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .text(d => d);
  }
}

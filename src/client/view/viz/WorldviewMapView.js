// Visualization suite: WorldviewMapView.js
// WorldviewMapView.js — Overview of all worldviews and their relationships (mockMode-first)
//
// This component visualizes all worldviews and their relationships in a map/graph.
//
// Requirements:
// - Must work in mockMode with static/mock data
// - D3.js for rendering
// - Modular, composable, and embeddable in any view
// - Accepts worldview map data as a prop
// - No backend dependencies

export class WorldviewMapView {
  /**
   * @param {HTMLElement} container
   * @param {Object[]} worldviewMapData - Array of worldview nodes/edges
   * @param {Object} [opts]
   */
  constructor(container, worldviewMapData, opts = {}) {
    this._el = container;
    this._data = worldviewMapData;
    this._opts = opts;
  }

  async render() {
    this._el.innerHTML = '';
    const d3 = await (await import('./d3.js')).loadD3();
    const width = this._opts.width || 800;
    const height = this._opts.height || 600;
    const svg = d3.select(this._el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'viz-worldview-map');

    // Convert nodes/edges from data
    const nodes = this._data.map(n => ({ ...n }));
    const links = [];
    this._data.forEach(n => {
      if (n.edges) n.edges.forEach(tgt => links.push({ source: n.id, target: tgt }));
    });

    // D3 force simulation with cluster separation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(40))
      .force('charge', d3.forceManyBody().strength(-60))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(18));

    const link = svg.append('g')
      .attr('stroke', '#bbb')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1);

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.type === 'herald' ? 14 : 10)
      .attr('fill', d => d.type === 'herald' ? '#f48fb1' : '#90caf9')
      .call(drag(sim));

    node.append('title').text(d => d.label);

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    function drag(sim) {
      function dragstarted(event, d) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event, d) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }
}

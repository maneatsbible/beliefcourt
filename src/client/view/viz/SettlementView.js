// Visualization suite: SettlementView.js
// SettlementView.js — Settlement/forgiveness visualization (mockMode-first)
//
// This component visualizes settlements, forgiveness, and regeneration events.
//
// Requirements:
// - Must work in mockMode with static/mock data
// - D3.js for rendering
// - Modular, composable, and embeddable in any view
// - Accepts settlement data as a prop
// - No backend dependencies

export class SettlementView {
  /**
   * @param {HTMLElement} container
   * @param {Object[]} settlementData - Array of settlement/forgiveness events
   * @param {Object} [opts]
   */
  constructor(container, settlementData, opts = {}) {
    this._el = container;
    this._data = settlementData;
    this._opts = opts;
  }

  async render() {
    this._el.innerHTML = '';
    const d3 = await (await import('./d3.js')).loadD3();
    const width = this._opts.width || 700;
    const height = this._opts.height || 300;
    const svg = d3.select(this._el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'viz-settlement');

    // Timeline of settlements/forgiveness
    const data = this._data.slice().sort((a, b) => new Date(a.ts) - new Date(b.ts));
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.ts)))
      .range([60, width - 20]);
    const y = d3.scalePoint()
      .domain([...new Set(data.map(d => d.from))])
      .range([40, height - 40]);

    svg.append('g')
      .attr('transform', `translate(0,${height - 30})`)
      .call(d3.axisBottom(x));
    svg.append('g')
      .attr('transform', `translate(60,0)`)
      .call(d3.axisLeft(y));

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#888')
      .text('Time');
    svg.append('text')
      .attr('x', 18)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#888')
      .attr('transform', `rotate(-90,18,${height / 2})`)
      .text('Person');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 180},${height - 60})`);
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 8).attr('fill', '#8bc34a');
    legend.append('text').attr('x', 16).attr('y', 4).text('Forgiveness').attr('font-size', 12).attr('fill', '#888');
    legend.append('circle').attr('cx', 90).attr('cy', 0).attr('r', 8).attr('fill', '#03a9f4');
    legend.append('text').attr('x', 106).attr('y', 4).text('Regeneration').attr('font-size', 12).attr('fill', '#888');
    legend.append('circle').attr('cx', 0).attr('cy', 24).attr('r', 8).attr('fill', '#ffc107');
    legend.append('text').attr('x', 16).attr('y', 28).text('Settlement').attr('font-size', 12).attr('fill', '#888');

    svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(new Date(d.ts)))
      .attr('cy', d => y(d.from))
      .attr('r', 8)
      .attr('fill', d => d.type === 'forgiveness' ? '#8bc34a' : (d.type === 'regeneration' ? '#03a9f4' : '#ffc107'))
      .attr('stroke', '#333')
      .attr('opacity', 0.8)
      .append('title')
      .text(d => `${d.type} from ${d.from} to ${d.to}: ${d.note}`);

    // Animate reveal
    svg.selectAll('circle')
      .attr('opacity', 0)
      .transition()
      .delay((d, i) => i * 40)
      .duration(400)
      .attr('opacity', 0.8);
  }
}

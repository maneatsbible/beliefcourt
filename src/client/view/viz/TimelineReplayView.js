// *** LEGACY VISUALIZATION FILES MUST BE MARKED FOR DELETION ***
// TimelineReplayView.js — Timeline/ledger replay visualization (mockMode-first)
//
// This component visualizes the replay of the case/ledger timeline, animating claims, duels, and judgments over time.
//
// Requirements:
// - Must work in mockMode with static/mock data
// - D3.js for rendering
// - Modular, composable, and embeddable in any view
// - Accepts timeline data as a prop
// - No backend dependencies

export class TimelineReplayView {
  /**
   * @param {HTMLElement} container
   * @param {Object[]} timelineData - Array of timeline events (claims, duels, judgments, etc.)
   * @param {Object} [opts]
   */
  constructor(container, timelineData, opts = {}) {
    this._el = container;
    this._data = timelineData;
    this._opts = opts;
  }

  async render() {
    this._el.innerHTML = '';
    const d3root = document.createElement('div');
    d3root.className = 'viz-timeline-replay';
    this._el.appendChild(d3root);

    // Controls (styled)
    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';
    controls.style.gap = '12px';
    controls.style.margin = '12px 0 8px 0';
    d3root.appendChild(controls);
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '<span style="font-size:18px;">▶️</span> <span>Play</span>';
    playBtn.className = 'btn btn--primary';
    playBtn.style.display = 'flex';
    playBtn.style.alignItems = 'center';
    playBtn.style.gap = '6px';
    const pauseBtn = document.createElement('button');
    pauseBtn.innerHTML = '<span style="font-size:18px;">⏸️</span> <span>Pause</span>';
    pauseBtn.className = 'btn btn--secondary';
    pauseBtn.style.display = 'flex';
    pauseBtn.style.alignItems = 'center';
    pauseBtn.style.gap = '6px';
    controls.appendChild(playBtn);
    controls.appendChild(pauseBtn);

    // Load D3 dynamically
    const { loadD3 } = await import('./d3.js');
    const d3 = await loadD3();

    // Basic dimensions
    const width = this._opts.width || 700;
    const height = this._opts.height || 120;
    const margin = { left: 60, right: 40, top: 30, bottom: 30 };

    // Prepare SVG
    d3root.innerHTML += '';
    const svg = d3.select(d3root)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Parse and sort events by timestamp
    let data = (this._data || []).map(e => ({ ...e, date: new Date(e.ts) }))
      .sort((a, b) => a.date - b.date);

    // Limit visible events if maxVisible is set
    const maxVisible = this._opts.maxVisible || 30;
    if (data.length > maxVisible) {
      // Show only the last maxVisible events
      data = data.slice(-maxVisible);
    }

    if (!data.length) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#888')
        .text('No timeline data');
      return;
    }

    // X scale: time
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    // Y position for events
    const y = height / 2;

    // Draw axis
    const xAxis = d3.axisBottom(x).ticks(Math.min(data.length, 8));
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    // Draw event line
    svg.append('line')
      .attr('x1', x(data[0].date))
      .attr('x2', x(data[data.length - 1].date))
      .attr('y1', y)
      .attr('y2', y)
      .attr('stroke', '#bbb')
      .attr('stroke-width', 2);

    // Event color by type
    const color = {
      claim: '#1976d2',
      challenge: '#d32f2f',
      answer: '#388e3c',
      judgment: '#fbc02d',
      settlement: '#7b1fa2',
      regeneration: '#0288d1',
    };

    // Tooltip on hover
    const tooltip = d3root.appendChild(document.createElement('div'));
    tooltip.className = 'viz-tooltip';
    Object.assign(tooltip.style, {
      position: 'absolute',
      pointerEvents: 'none',
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '6px 10px',
      fontSize: '13px',
      color: '#222',
      boxShadow: '0 2px 8px #0002',
      display: 'none',
      zIndex: 10,
    });

    // Animation state
    let animIdx = 0;
    let animTimer = null;
    let isPlaying = false;

    // Draw all events, but hide them initially
    const eventGroups = svg.selectAll('g.event')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'event')
      .style('opacity', 0.2);

    eventGroups.append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', y)
      .attr('r', 13)
      .attr('fill', d => color[d.type] || '#888')
      .attr('stroke', '#222')
      .attr('stroke-width', 1.5);

    eventGroups.append('text')
      .attr('x', d => x(d.date))
      .attr('y', y - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#333')
      .text(d => d.type.charAt(0).toUpperCase());

    // Tooltip events
    eventGroups.select('circle')
      .on('mouseover', function(event, d) {
        tooltip.style.display = 'block';
        tooltip.innerHTML = `<b>${d.type.toUpperCase()}</b><br>${d.text}<br><i>${d.person}</i><br>${d.date.toLocaleString()}`;
      })
      .on('mousemove', function(event) {
        tooltip.style.left = (event.offsetX + 18) + 'px';
        tooltip.style.top = (event.offsetY - 10) + 'px';
      })
      .on('mouseout', function() {
        tooltip.style.display = 'none';
      });

    function showEvents(upTo) {
      eventGroups.transition().duration(300).style('opacity', (d, i) => i <= upTo ? 1 : 0.2);
      // Highlight current
      eventGroups.select('circle').attr('stroke', (d, i) => i === upTo ? '#000' : '#222').attr('stroke-width', (d, i) => i === upTo ? 3 : 1.5);
    }

    function play() {
      if (isPlaying) return;
      isPlaying = true;
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      if (animIdx >= data.length) animIdx = 0;
      showEvents(animIdx - 1);
      animTimer = setInterval(() => {
        if (animIdx < data.length) {
          showEvents(animIdx);
          animIdx++;
        } else {
          pause();
        }
      }, 900);
    }

    function pause() {
      isPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      if (animTimer) clearInterval(animTimer);
      animTimer = null;
    }

    playBtn.onclick = play;
    pauseBtn.onclick = pause;

    // Initial state
    pause();
    showEvents(-1);
  }
}

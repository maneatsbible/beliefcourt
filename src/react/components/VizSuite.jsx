import React, { useEffect, useRef } from 'react';
// These imports will be replaced with React-based visualizations in the future
// For now, we use the legacy D3-based classes via refs
import { MOCK_TIMELINE, MOCK_EEO, MOCK_ADJACENCY, MOCK_SETTLEMENTS, MOCK_WORLDVIEW_MAP } from '../../client/mock/viz-mock-data.js';

export function VizSuite() {
  const mapRef = useRef();
  const eeoRef = useRef();
  const adjRef = useRef();
  const settleRef = useRef();
  const timelineRef = useRef();

  useEffect(() => {
    // Dynamically import legacy D3-based classes and render into refs
    (async () => {
      const { WorldviewMapView } = await import('../../client/view/viz/WorldviewMapView.js');
      const { EEOView } = await import('../../client/view/viz/EEOView.js');
      const { AdjacencyView } = await import('../../client/view/viz/AdjacencyView.js');
      const { SettlementView } = await import('../../client/view/viz/SettlementView.js');
      const { TimelineReplayView } = await import('../../client/view/viz/TimelineReplayView.js');
      new WorldviewMapView(mapRef.current, MOCK_WORLDVIEW_MAP, { width: 800, height: 400 }).render();
      new EEOView(eeoRef.current, MOCK_EEO, { width: 600, height: 300 }).render();
      new AdjacencyView(adjRef.current, MOCK_ADJACENCY, { width: 600, height: 300 }).render();
      new SettlementView(settleRef.current, MOCK_SETTLEMENTS, { width: 700, height: 200 }).render();
      new TimelineReplayView(timelineRef.current, MOCK_TIMELINE, { width: 1800, maxVisible: 30 }).render();
    })();
  }, []);

  // Analytics
  const timelineCount = MOCK_TIMELINE.length;
  const uniquePeople = new Set(MOCK_TIMELINE.map(e => e.person)).size;
  const worldviewCount = MOCK_WORLDVIEW_MAP.length;
  const eeoLinks = MOCK_EEO.reduce((acc, n) => acc + (n.edges ? n.edges.length : 0), 0);
  const settlements = MOCK_SETTLEMENTS.length;
  const adjPairs = MOCK_ADJACENCY.length;

  return (
    <div className="viz-suite viz-suite--viz">
      <div className="viz-marketing-wrap">
        <div className="viz-hero">
          <h1 className="viz-title">Analytics Visualization Suite Demo</h1>
          <p className="viz-tagline">Explore the full interactive analytics and visualization demo suite for Truthbook. See the story of truth, challenge, and forgiveness unfold in real time. Explore the living network of beliefs, disputes, and reconciliation.</p>
          <div className="viz-analytics">
            <div><b>{timelineCount}</b> timeline events</div>
            <div><b>{uniquePeople}</b> unique participants</div>
            <div><b>{worldviewCount}</b> worldviews mapped</div>
            <div><b>{eeoLinks}</b> epistemic links</div>
            <div><b>{settlements}</b> settlements & acts of forgiveness</div>
            <div><b>{adjPairs}</b> worldview adjacencies</div>
          </div>
        </div>
        <div className="viz-block viz-block--worldview-map" style={{ minHeight: 400 }} ref={mapRef} />
        <div className="viz-block viz-block--eeo" style={{ minHeight: 300 }} ref={eeoRef} />
        <div className="viz-block viz-block--adjacency" style={{ minHeight: 300 }} ref={adjRef} />
        <div className="viz-block viz-block--settlement" style={{ minHeight: 200 }} ref={settleRef} />
        <div className="viz-block viz-block--timeline" style={{ overflowX: 'auto', maxWidth: '100%' }} ref={timelineRef} />
      </div>
    </div>
  );
}

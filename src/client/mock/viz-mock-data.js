// Deep, rich mock data for all visualizations (timeline, EEO, adjacency, settlements, worldview map)
// Used for static mockMode visualizations in /viz/

// Generate a large, rich timeline with 100+ events, multiple persons, types, and forgiveness cycles
const people = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'herald'];
const types = ['claim', 'challenge', 'answer', 'judgment', 'settlement', 'regeneration', 'confession', 'forgiveness'];
const baseTs = new Date('2026-01-01T10:00:00Z').getTime();
const timelineEvents = [];
for (let i = 0; i < 120; i++) {
  const type = types[i % types.length];
  const person = people[i % people.length];
  let text = '';
  if (type === 'claim') text = `Claim #${i}: ${person} says something bold.`;
  else if (type === 'challenge') text = `Challenge #${i}: ${person} disputes a claim.`;
  else if (type === 'answer') text = `Answer #${i}: ${person} responds thoughtfully.`;
  else if (type === 'judgment') text = `Judgment #${i}: ${person} renders a verdict.`;
  else if (type === 'settlement') text = `Settlement #${i}: ${person} accepts a resolution.`;
  else if (type === 'regeneration') text = `Regeneration #${i}: ${person} offers restoration.`;
  else if (type === 'confession') text = `Confession #${i}: ${person} admits a mistake and asks forgiveness.`;
  else if (type === 'forgiveness') text = `Forgiveness #${i}: ${person} forgives with mercy and prayer.`;
  timelineEvents.push({
    type,
    id: `rec-${i+1}`,
    person,
    text,
    ts: new Date(baseTs + i * 1000 * 60 * 5).toISOString(),
  });
}
export const MOCK_TIMELINE = timelineEvents;

// Generate a large EEO graph (50 nodes, random edges)
const eeoNodes = [];
const eeoEdges = [];
for (let i = 0; i < 50; i++) {
  eeoNodes.push({
    id: `wv-${i}`,
    label: `Person ${i}`,
    type: i % 7 === 0 ? 'herald' : 'person',
    edges: [],
  });
}
for (let i = 0; i < 100; i++) {
  const src = `wv-${Math.floor(Math.random() * 50)}`;
  let tgt = `wv-${Math.floor(Math.random() * 50)}`;
  if (src === tgt) tgt = `wv-${(parseInt(src.split('-')[1]) + 1) % 50}`;
  eeoNodes.find(n => n.id === src).edges.push(tgt);
  eeoEdges.push({ source: src, target: tgt });
}
export const MOCK_EEO = eeoNodes;

// Generate adjacency data for all EEO nodes (random distances)
export const MOCK_ADJACENCY = eeoEdges.map(e => ({
  source: e.source,
  target: e.target,
  distance: +(Math.random() * 1.2).toFixed(2),
}));

// Generate 40 settlements, forgiveness, and regeneration events
export const MOCK_SETTLEMENTS = Array.from({ length: 40 }, (_, i) => {
  const from = people[i % people.length];
  const to = people[(i + 1) % people.length];
  const type = i % 3 === 0 ? 'forgiveness' : (i % 3 === 1 ? 'regeneration' : 'settlement');
  return {
    id: `settle-${i+1}`,
    from,
    to,
    type,
    ts: new Date(baseTs + 1000 * 60 * 60 * i).toISOString(),
    note: `${type.charAt(0).toUpperCase() + type.slice(1)} event #${i+1}: ${from} to ${to}`,
  };
});

// Worldview map: same as EEO but with more edges and clusters
const clusters = 5;
const nodesPerCluster = 12;
const mapNodes = [];
const mapEdges = [];
for (let c = 0; c < clusters; c++) {
  for (let n = 0; n < nodesPerCluster; n++) {
    const id = `wv-c${c}n${n}`;
    mapNodes.push({
      id,
      label: `Cluster${c} Person${n}`,
      type: n % 10 === 0 ? 'herald' : 'person',
      edges: [],
    });
  }
}
for (let c = 0; c < clusters; c++) {
  for (let n = 0; n < nodesPerCluster; n++) {
    const src = `wv-c${c}n${n}`;
    // Connect to 2-4 random nodes in same cluster
    for (let e = 0; e < 2 + Math.floor(Math.random() * 3); e++) {
      let tgt = `wv-c${c}n${Math.floor(Math.random() * nodesPerCluster)}`;
      if (src !== tgt) mapNodes.find(nd => nd.id === src).edges.push(tgt);
      mapEdges.push({ source: src, target: tgt });
    }
    // Inter-cluster bridges
    if (n % 7 === 0 && c < clusters - 1) {
      const tgt = `wv-c${c+1}n${(n*3)%nodesPerCluster}`;
      mapNodes.find(nd => nd.id === src).edges.push(tgt);
      mapEdges.push({ source: src, target: tgt });
    }
  }
}
export const MOCK_WORLDVIEW_MAP = mapNodes;

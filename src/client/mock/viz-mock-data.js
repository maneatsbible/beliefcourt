// Deep, rich mock data for all visualizations (timeline, EEO, adjacency, settlements, worldview map)
// Used for static mockMode visualizations in /viz/

export const MOCK_TIMELINE = [
  { type: 'claim', id: 'rec-1', person: 'alice', text: 'The sky is blue.', ts: '2026-01-01T10:00:00Z' },
  { type: 'challenge', id: 'rec-2', person: 'bob', text: 'Not always — sometimes it is gray.', ts: '2026-01-01T10:05:00Z' },
  { type: 'answer', id: 'rec-3', person: 'alice', text: 'On clear days, it is blue.', ts: '2026-01-01T10:10:00Z' },
  { type: 'judgment', id: 'rec-4', person: 'herald', text: 'Judgment: Alice supported, Bob challenged.', ts: '2026-01-01T10:20:00Z' },
  { type: 'settlement', id: 'rec-5', person: 'bob', text: 'I accept the answer.', ts: '2026-01-01T10:25:00Z' },
  { type: 'regeneration', id: 'rec-6', person: 'alice', text: 'Forgiveness offered.', ts: '2026-01-01T10:30:00Z' },
];

export const MOCK_EEO = [
  { id: 'wv-alice', label: 'Alice', type: 'person', edges: ['wv-bob', 'wv-herald'] },
  { id: 'wv-bob', label: 'Bob', type: 'person', edges: ['wv-alice'] },
  { id: 'wv-herald', label: 'Herald', type: 'herald', edges: ['wv-alice'] },
];

export const MOCK_ADJACENCY = [
  { source: 'wv-alice', target: 'wv-bob', distance: 0.7 },
  { source: 'wv-alice', target: 'wv-herald', distance: 0.3 },
  { source: 'wv-bob', target: 'wv-herald', distance: 0.8 },
];

export const MOCK_SETTLEMENTS = [
  { id: 'settle-1', from: 'bob', to: 'alice', type: 'forgiveness', ts: '2026-01-01T10:30:00Z', note: 'Forgiven for challenge.' },
  { id: 'settle-2', from: 'alice', to: 'bob', type: 'regeneration', ts: '2026-01-01T10:31:00Z', note: 'Relationship restored.' },
];

export const MOCK_WORLDVIEW_MAP = [
  { id: 'wv-alice', label: 'Alice', type: 'person', edges: ['wv-bob', 'wv-herald'] },
  { id: 'wv-bob', label: 'Bob', type: 'person', edges: ['wv-alice'] },
  { id: 'wv-herald', label: 'Herald', type: 'herald', edges: ['wv-alice'] },
];

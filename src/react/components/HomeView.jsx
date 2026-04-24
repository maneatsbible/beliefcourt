import React, { useState, useEffect, useRef } from 'react';
import { RecordCard } from './RecordCard.jsx';
import { Composer } from './Composer.jsx';

const PER_PAGE = 30;

// Mock controller for demo
const mockRecords = Array.from({ length: 45 }, (_, i) => ({
  id: `rec${i+1}`,
  text: `Claim #${i+1}: This is a sample claim for demonstration purposes.`,
  author: `user${(i%3)+1}`,
}));

const mockController = {
  async loadClaims(page) {
    await new Promise(r => setTimeout(r, 200));
    const start = (page-1)*PER_PAGE;
    return mockRecords.slice(start, start+PER_PAGE);
  },
  canChallenge() { return true; },
  canAgree() { return true; },
  async submitClaim(text) { alert(`Claim submitted: ${text}`); },
  async submitChallenge(id, text) { alert(`Challenge for ${id}: ${text}`); },
  async submitClaimAgreement(id) { alert(`Agreed to ${id}`); },
};

export function HomeView({ currentUser = { id: 'user1', handle: 'user1' } }) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const feedRef = useRef();

  useEffect(() => {
    loadNextPage();
    // eslint-disable-next-line
  }, []);

  async function loadNextPage() {
    if (loading || allLoaded) return;
    setLoading(true);
    const newRecords = await mockController.loadClaims(page);
    setRecords(prev => [...prev, ...newRecords]);
    if (newRecords.length < PER_PAGE) setAllLoaded(true);
    else setPage(p => p+1);
    setLoading(false);
  }

  function handleFeedClick(record) {
    alert(`Open record: ${record.text}`);
  }

  function handleComposerSubmit({ text }) {
    mockController.submitClaim(text);
    setShowComposer(false);
    setRecords([]);
    setPage(1);
    setAllLoaded(false);
    setTimeout(loadNextPage, 100);
  }

  return (
    <div className="home-view">
      <div className="home-toolbar" id="home-toolbar">
        {showComposer && (
          <Composer
            mode="claim"
            placeholder="Make a claim…"
            onSubmit={handleComposerSubmit}
            onCancel={() => setShowComposer(false)}
          />
        )}
      </div>
      <div className="home-feed" id="home-feed" ref={feedRef}>
        {records.length === 0 && !loading && (
          <p className="empty-state">No claims yet. Be the first to make one ⚖</p>
        )}
        {records.map(record => (
          <RecordCard
            key={record.id}
            record={record}
            perms={{ canChallenge: mockController.canChallenge(), canAgree: mockController.canAgree() }}
            user={currentUser}
            onOpen={handleFeedClick}
          />
        ))}
        {!allLoaded && (
          <button onClick={loadNextPage} disabled={loading} style={{ margin: '1em auto', display: 'block' }}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
      <button className="fab-compose" id="home-compose-fab"
              disabled={!currentUser}
              aria-label="Make a claim"
              onClick={() => setShowComposer(true)}>
        <span aria-hidden="true">⚖</span>
      </button>
    </div>
  );
}

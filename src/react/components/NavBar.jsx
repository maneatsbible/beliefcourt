import React from 'react';

const ICON_HEART_ON_FIRE = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28" style={{ verticalAlign: 'middle' }}>
    <rect width="100" height="100" rx="18" fill="#181828" />
    <text x="50" y="58" textAnchor="middle" fontSize="54" dominantBaseline="middle">❤️</text>
    <text x="62" y="70" textAnchor="middle" fontSize="38" dominantBaseline="middle">🔥</text>
  </svg>
);

export function NavBar({ version = 'v0.0.1-pre-alpha', handle = null, onNavigate, isAuthenticated, login, logout }) {
  const activeView = (new URLSearchParams(window.location.search)).get('v') || 'home';
  const personLabel = handle ? `@${handle}` : 'Sign in';

  const handleNav = (view) => {
    if (onNavigate) onNavigate(view);
    if (view === 'home') {
      window.location.search = '';
    } else if (view === 'search') {
      alert('Search: [TODO] Implement search popup/modal.');
    } else {
      const params = new URLSearchParams(window.location.search);
      params.set('v', view);
      window.location.search = params.toString();
    }
  };

  return (
    <nav id="app-nav">
      <div className="nav-bar-flex" style={{ display: 'flex', alignItems: 'stretch', width: '100%', height: '100%' }}>
        <div style={{ flex: '0 0 28%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <button className={`nav-tab${activeView === 'home' ? ' nav-tab--active' : ''}`}
                  aria-label="Home" aria-current={activeView === 'home' ? 'page' : undefined}
                  style={{ width: '100%', height: '100%', minWidth: 90 }}
                  onClick={() => handleNav('home')}>
            <span className="nav-tab__icon" aria-hidden="true">{ICON_HEART_ON_FIRE}</span>
            <span className="nav-tab__label">Home</span>
            <span className="nav-tab__caption">Go to the main feed and see the latest claims and duels.</span>
          </button>
        </div>
        <div style={{ flex: '1 1 44%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className={`nav-tab${activeView === 'search' ? ' nav-tab--active' : ''}`}
                  aria-label="Search" aria-current={activeView === 'search' ? 'page' : undefined}
                  style={{ width: '100%', height: '100%', minWidth: 90 }}
                  onClick={() => handleNav('search')}>
            <span className="nav-tab__icon" aria-hidden="true">🔍</span>
            <span className="nav-tab__label">Search</span>
            <span className="nav-tab__caption">Find claims, people, and cases across the platform.</span>
          </button>
        </div>
        <div style={{ flex: '0 0 18%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className={`nav-tab${activeView === 'person' ? ' nav-tab--active' : ''}`}
                  aria-label={handle || 'Profile'} aria-current={activeView === 'person' ? 'page' : undefined}
                  style={{ width: '100%', height: '100%', minWidth: 90 }}
                  onClick={() => handleNav('person')}>
            <span className="nav-tab__icon" aria-hidden="true">👤</span>
            <span className="nav-tab__label">{personLabel}</span>
            <span className="nav-tab__caption">View your profile, records, and settings.</span>
          </button>
        </div>
        <div style={{ flex: '0 0 10%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12, gap: 8 }}>
          <span className="nav-tab__version" style={{ fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{version}</span>
          {isAuthenticated ? (
            <button className="btn btn--secondary" style={{ marginLeft: 8 }} onClick={logout}>Logout</button>
          ) : (
            <button className="btn btn--primary" style={{ marginLeft: 8 }} onClick={() => login('alice')}>Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}

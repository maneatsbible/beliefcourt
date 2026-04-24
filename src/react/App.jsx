import React, { useState } from 'react';
import { NavBar } from './components/NavBar.jsx';
import { HomeView } from './components/HomeView.jsx';
import { VizSuite } from './components/VizSuite.jsx';
import { useUser } from './context/UserContext.jsx';
import { CaseView } from './components/CaseView.jsx';
import { PersonView } from './components/PersonView.jsx';

function getInitialView() {
  const params = new URLSearchParams(window.location.search);
  return params.get('v') || 'home';
}

export function App() {
  const [view, setView] = useState(getInitialView());
  const { user, isAuthenticated, login, logout } = useUser();

  const handleNavigate = (newView) => {
    setView(newView);
    const params = new URLSearchParams(window.location.search);
    if (newView === 'home') {
      params.delete('v');
    } else {
      params.set('v', newView);
    }
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  React.useEffect(() => {
    const onPopState = () => setView(getInitialView());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Extract id param for case/person views
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  return (
    <div>
      <NavBar
        version="v0.0.1-pre-alpha"
        handle={user?.handle || null}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        login={login}
        logout={logout}
      />
      <main style={{ padding: 24 }}>
        {view === 'home' && <HomeView currentUser={user} />}
        {view === 'viz' && <VizSuite />}
        {view === 'case' && id && <CaseView caseId={id} />}
        {view === 'person' && id && <PersonView personId={id} />}
        {(view !== 'home' && view !== 'viz' && view !== 'case' && view !== 'person') && <p className="empty-state">Unknown view.</p>}
      </main>
    </div>
  );
}

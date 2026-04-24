import React from 'react';
import { VizSuite } from './VizSuite.jsx';

// Placeholder: In a real app, filter/mock data for a specific case
export function CaseView({ caseId }) {
  return (
    <div>
      <h2>Case View (React)</h2>
      <p>Case ID: {caseId}</p>
      <VizSuite />
    </div>
  );
}

import React from 'react';
import { VizSuite } from './VizSuite.jsx';

// Placeholder: In a real app, filter/mock data for a specific person
export function PersonView({ personId }) {
  return (
    <div>
      <h2>Person View (React)</h2>
      <p>Person ID: {personId}</p>
      <VizSuite />
    </div>
  );
}

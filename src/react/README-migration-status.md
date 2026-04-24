# React Migration Status

## Migrated to React
- NavBar (navigation bar)
- Composer (claim/challenge composer)
- HomeView (main feed)
- RecordCard (feed item)
- VizSuite (visualization suite wrapper)
- UserContext (auth/user state)
- App (routing, view switching)

## Remaining (Legacy)
- Case view (timeline + settlements for a case)
- Person view (EEO + adjacency for a person)
- Dispute view
- Error panel, notification, judgment panel, etc.
- Remove or archive legacy JS files as React versions are completed

## Next Steps
- Migrate case and person views to React
- Migrate error/notification components
- Remove unused legacy JS files from src/client/view, src/client/controller, etc.
- Integrate real API/auth if needed

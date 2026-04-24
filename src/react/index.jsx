
import React from 'react';
import ReactDOM from 'react-dom/client';

import { UserProvider } from './context/UserContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
	<UserProvider>
		<App />
	</UserProvider>
);

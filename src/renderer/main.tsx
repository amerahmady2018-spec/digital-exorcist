import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Web Demo Mode: Initialize mock Electron API if not in Electron
const isWebDemo = !window.electronAPI || import.meta.env.VITE_WEB_DEMO === 'true';

if (isWebDemo) {
  // Dynamically import and initialize mock API
  import('./mocks/electronAPI.mock').then(({ initMockElectronAPI }) => {
    initMockElectronAPI();
    renderApp();
  });
} else {
  // Set up global error listener for IPC events (prevents unhandled error crashes)
  if (window.electronAPI?.onError) {
    window.electronAPI.onError((error) => {
      console.error('[IPC Error]:', error);
    });
  }
  renderApp();
}

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

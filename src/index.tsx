import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import AppThemeProvider from './ui/theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>
);

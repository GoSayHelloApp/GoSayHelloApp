import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import AppThemeProvider from './ui/theme';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <AppThemeProvider>
          <App />
        </AppThemeProvider>
      </Provider >
    </Router>
  </React.StrictMode>
);

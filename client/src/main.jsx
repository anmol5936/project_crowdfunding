import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { StateContextProvider } from './context';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Removed '!' for JavaScript

root.render(
  <React.StrictMode>
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </React.StrictMode>
);

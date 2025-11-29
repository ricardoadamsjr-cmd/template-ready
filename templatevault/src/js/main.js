// src/js/main.js
//This file will be the actual entry point for your client-side React app that gets executed in the browser after being built.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App'; // Import your main App component from src/App.jsx

// This is the client-side entry point that mounts your React application to the DOM.
// It does NOT contain any server-side code or direct DOM manipulation for specific buttons.

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Element with ID 'root' not found in the DOM.");
}

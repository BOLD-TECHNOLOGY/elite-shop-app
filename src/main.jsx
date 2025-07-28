import { createRoot } from "react-dom/client";
import AppProvider from "./Context/AppProvider.jsx";
import React from 'react';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)

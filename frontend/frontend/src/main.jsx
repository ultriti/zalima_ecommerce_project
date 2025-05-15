import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const rootElement = document.getElementById('root');

window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  if (event.error && event.error.message && event.error.message.includes('React')) {
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #4299e1; color: white; border: none; border-radius: 4px; margin-top: 10px;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
});

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </React.StrictMode>,
)

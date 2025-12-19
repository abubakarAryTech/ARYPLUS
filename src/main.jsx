import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * TIZEN HARDWARE KEY REGISTRATION
 * This must run as soon as the app starts so the TV 
 * knows to send remote button presses to your code.
 */
if (window.tizen) {
    try {
        // 'Return' is the back button on the Samsung remote
        window.tizen.tvinputdevice.registerKey('Return');
        window.tizen.tvinputdevice.registerKey('Exit');
        window.tizen.tvinputdevice.registerKey('Menu');
    } catch (e) {
        console.error("Tizen API not available or failed to register keys:", e);
    }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
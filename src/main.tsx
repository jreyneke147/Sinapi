import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ManualLanding from './components/ManualLanding';
import './index.css';

const params = new URLSearchParams(window.location.search);
const manualId = params.get('manual');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {manualId ? <ManualLanding id={manualId} /> : <App />}
  </StrictMode>
);

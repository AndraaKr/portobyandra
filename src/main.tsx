import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/instrument-serif/latin-ext-400.css';
import '@fontsource-variable/inter-tight/index.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import App from './App.tsx';
import './index.css';
import { installSinglePlayback } from './media/singlePlayback';

installSinglePlayback();

if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-on');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

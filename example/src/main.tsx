import { createRoot } from 'react-dom/client';
import App from './App';

// Note: StrictMode is disabled because it causes WebGPU resources
// to be initialized twice, leading to "Cannot read properties of undefined" errors.
// WebGPU resources need careful lifecycle management and don't work well
// with React's double-render behavior in StrictMode.
createRoot(document.getElementById('root')!).render(<App />);

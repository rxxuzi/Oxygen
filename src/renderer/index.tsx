import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

console.log('Renderer starting...');
console.log('window.electron:', window.electron);

// Add TypeScript support for window.electron
declare global {
    interface Window {
        electron: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            send: (channel: string, ...args: any[]) => void;
            on: (channel: string, callback: (...args: any[]) => void) => () => void;
            once: (channel: string, callback: (...args: any[]) => void) => void;
            shell: {
                openPath: (path: string) => Promise<string>;
                showItemInFolder: (path: string) => Promise<void>;
            };
            dialog: {
                openFolder: () => Promise<string | null>;
            };
        };
    }
}

// Create root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(container);

// Render app
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
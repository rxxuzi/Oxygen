import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    root: path.resolve(__dirname, '../src/renderer'),
    base: './',
    plugins: [react()],
    css: {
        postcss: path.resolve(__dirname, '../postcss.config.js'),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
            '@renderer': path.resolve(__dirname, '../src/renderer'),
            '@shared': path.resolve(__dirname, '../src/shared'),
        },
    },
    build: {
        outDir: path.resolve(__dirname, '../dist/renderer'),
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, '../src/renderer/index.html'),
            },
        },
    },
    server: {
        port: 9800,
        strictPort: true,
    },
});
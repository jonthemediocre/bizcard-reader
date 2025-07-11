import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    preview: {
        port: 4173,
        host: true,
        strictPort: true,
    },
    server: {
        host: true,
        strictPort: true,
        port: 5173,
    },
});

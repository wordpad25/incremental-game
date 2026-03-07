import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'incremental_game',
            filename: 'remoteEntry.js',
            exposes: {
                './Game': './src/App.jsx',
            },
            shared: ['react', 'react-dom']
        })
    ],
    server: {
        port: 5005,
        strictPort: true,
    },
    build: {
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false
    }
})

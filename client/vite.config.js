import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'



export default defineConfig({
  server: { 
    host: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        secure: false,
        changeOrigin: true
      }
    }
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MeeCU Video Chat',
        short_name: 'MeeCU',
        description: 'Stranger-to-stranger college video chat platform',
        theme_color: '#FF3B3B',
        background_color: '#11131A',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



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
    react()
  ]
})

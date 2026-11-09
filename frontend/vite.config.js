import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/movies': 'http://localhost:3000',
      '/genres': 'http://localhost:3000',
      '/trailer': 'http://localhost:3000',
      '/movie': 'http://localhost:3000',
      '/person': 'http://localhost:3000'
    },
  },
})

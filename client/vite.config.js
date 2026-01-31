import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/internshiptracker/',
  build: {
    outDir: '../docs'
  },
  server: {
    port: 5173
  }
})

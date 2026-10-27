import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/magazine-linked-calendar-app/',
  plugins: [react()],
})

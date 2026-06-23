/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base 設為 '/work-hub/' 以利 GitHub Pages 專案站台部署
export default defineConfig({
  base: '/work-hub/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})

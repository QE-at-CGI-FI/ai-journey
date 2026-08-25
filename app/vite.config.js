import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // GitHub Pages serves project sites from /<repo-name>/
  base: command === 'build' ? '/ai-journey/' : '/',
}))

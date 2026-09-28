import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(appDir, '../..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Shared frontend/.env* first, then this app's .env* (app wins on conflicts).
  const env = {
    ...loadEnv(mode, frontendRoot, ''),
    ...loadEnv(mode, appDir, ''),
  }

  // Apply merged values so Vite exposes them on import.meta.env
  // (existing process.env wins over envDir files).
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value
  }

  return {
    plugins: [react(), tailwindcss()],
    envDir: appDir,
  }
})

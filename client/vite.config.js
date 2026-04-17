import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useRemote = env.VITE_API_URL && !env.VITE_API_URL.includes('localhost')

  return {
    plugins: [react()],
    server: {
      proxy: useRemote ? {} : {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    }
  }
})
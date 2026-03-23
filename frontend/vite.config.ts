import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the Form.io backend during development
    // This avoids any CORS issues and keeps API calls clean
    proxy: {
      '/form': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})


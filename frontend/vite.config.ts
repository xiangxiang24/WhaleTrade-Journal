import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',   // สำคัญ: ให้ path ของไฟล์ build ใช้ได้ตอนโหลดด้วย file://
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:3001' } },
});
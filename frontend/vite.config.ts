import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss()],
  base: './',   // สำคัญ: ให้ path ของไฟล์ build ใช้ได้ตอนโหลดด้วย file://
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:3001' } },
});

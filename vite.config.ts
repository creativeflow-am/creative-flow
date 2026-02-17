import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Gunakan titik agar bisa jalan di mana saja
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
});
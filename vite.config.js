import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { copyFileSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'

// Copie manifest.json dans le dossier final de build
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    closeBundle() {
      copyFileSync('src/manifest.json', 'dist/manifest.json')
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    copyManifest(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: fileURLToPath(new URL('./index.html', import.meta.url)),
      }
    }
  }
})

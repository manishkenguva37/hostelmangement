import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'


// === CONFIG ===
export default defineConfig({
  plugins: [
    vue2(),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
 
  // ✅ ADD THIS PART TO FIX CORS IN LOCAL DEVELOPMENT
//   server: {
//   proxy: {
//     '/api': {
//       target: 'https://script.google.com/macros/s/AKfycbwLvW9kA5Vd6tmEPfC5C0RYSkZn9jtG8FHIsPvtP8uegOmAPvumcoabGoDb1ujOAeKSnA/exec',
//       changeOrigin: true,
//       rewrite: (path) => path.replace(/^\/api/, '')
//     }
//   }
// }


})

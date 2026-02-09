import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'figma-asset-resolver',
      enforce: 'pre',
      resolveId(source) {
        const prefix = 'figma:asset/'
        if (!source.startsWith(prefix)) {
          return null
        }

        const assetPath = source.slice(prefix.length)
        return path.resolve(__dirname, 'src/assets', assetPath)
      },
    },
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (id.includes('/react-dnd/') || id.includes('/react-dnd-html5-backend/')) {
            return 'vendor-dnd'
          }
          if (id.includes('/react-day-picker/')) {
            return 'vendor-day-picker'
          }
          if (id.includes('/@radix-ui/')) {
            return 'vendor-radix'
          }
          return 'vendor'
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})

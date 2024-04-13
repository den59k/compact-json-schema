import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [ dts({ rollupTypes: true }) ],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry:  "src/index.ts",
      formats: [ "cjs", "es" ],
      fileName: "index",
      name: "main"
    },
    rollupOptions: {
      external: [
        /^node:/
      ],
    }
  },
})
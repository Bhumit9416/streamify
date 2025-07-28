import { defineConfig } from "vite"
import react from "@vitejs/plugin-react" // Use @vitejs/plugin-react for JS/JSX

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src", // Alias for your project components if needed, adjust if different
    },
  },
})

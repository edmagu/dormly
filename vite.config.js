import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path: '/<repo-name>/' for GitHub Pages project sites
// Change to '/' if you add a custom domain later
export default defineConfig({
  base: "/dormly/",
  plugins: [react()],
});

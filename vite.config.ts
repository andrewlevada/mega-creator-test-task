import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"~components": "/src/components",
			"~utils": "/src/utils",
			"~styles": "/src/assets/styles",
			"~src": "/src"
		},
	},
	build: {
		outDir: "build"
	}
})


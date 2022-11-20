import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"~components": "/src/components",
			"~utils": "/src/utils",
			"~styles": "/src/assets/styles",
			"~graphics": "./src/assets/graphics",
			"~src": "/src"
		},
	},
	build: {
		outDir: "build"
	},
	base: "/mega-creator-test-task/",
})


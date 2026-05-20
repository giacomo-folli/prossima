import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			strategies: "generateSW",
			srcDir: "src",
			filename: "sw.js",
			registerType: "prompt",
			manifest: {
				name: "Prossima",
				short_name: "Prossima",
				display: "standalone",
				start_url: "/prossima",
				theme_color: "#2d6a4f",
				background_color: "#ffffff",
				icons: [
					{
						src: "/prossima/icon-64.png",
						sizes: "64x64",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/prossima/icon-180.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/prossima/icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/prossima/icon-1024.png",
						sizes: "1024x1024",
						type: "image/png",
						purpose: "any",
					},
				],
			},
			workbox: {
				// Catch everything generated in the build output
				globPatterns: [
					"**/*.{js,css,html,ico,png,svg,webp,webmanifest,woff,woff2}",
				],
				// Clean navigation fallback for Single Page Apps (SPA)
				navigateFallback: "/200.html",
				navigateFallbackAllowlist: [/^\/$/],
			},
		}),
	],
});

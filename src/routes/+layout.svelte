<script lang="ts">
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";
	import { pwaInfo } from "virtual:pwa-info";
	import { onMount, type Snippet } from "svelte";
	import { supabase } from "$lib/supabase";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { sessions } from "$lib/stores/sessions";
	import { user } from "$lib/stores/user";
	import { loadUser } from "$lib/utils/storage";
	import type { Session } from "@supabase/supabase-js";

	let pwaWebManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");
	let isSignedIn = $state(false);

	const hideTabBar = $derived(page.url.pathname.includes("/training"));

	onMount(() => {
		let authVersion = 0;
		let authTimer: ReturnType<typeof setTimeout> | undefined;

		if (pwaInfo) {
			import("virtual:pwa-register")
				.then(({ registerSW }) => {
					registerSW({ immediate: true });
				})
				.catch((error) => {
					console.error("Errore registrazione service worker:", error);
				});
		}

		const privRoutes = [
			"analytics",
			"training",
			"settings",
			"exercises",
			"home",
		];

		const syncTheme = () => {
			const savedTheme = localStorage.getItem("theme") || "auto";
			const isDark =
				savedTheme === "dark" ||
				(savedTheme === "auto" &&
					window.matchMedia("(prefers-color-scheme: dark)").matches);

			document.documentElement.classList.toggle("dark", isDark);
		};

		syncTheme();

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		mediaQuery.addEventListener("change", syncTheme);
		window.addEventListener("storage", syncTheme);
		window.addEventListener("theme-changed", syncTheme);

		const syncAuth = async (session: Session | null, version: number) => {
			const isCurrent = () => version === authVersion;

			if (!isCurrent()) return;

			if (!session) {
				const protectedRouteActive = privRoutes.some((route) =>
					page.url.pathname.includes(route),
				);

				if (protectedRouteActive) {
					await goto(resolve("/auth"));
				}

				return;
			}

			await sessions.init();
			if (!isCurrent()) return;

			const userProfile = await loadUser();
			if (!isCurrent()) return;

			$user = userProfile
				? {
						...userProfile,
						email: session.user.email,
					}
				: null;

			if (page.url.pathname.includes("auth")) {
				await goto(resolve("/home"));
			}
		};

		// Riceve anche INITIAL_SESSION: non serve chiamare getSession().
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			const version = ++authVersion;

			isSignedIn = !!session;

			if (!session) {
				$user = null;
			}

			if (authTimer !== undefined) {
				clearTimeout(authTimer);
			}

			// Avvia le operazioni dopo la conclusione del callback auth.
			authTimer = setTimeout(() => {
				authTimer = undefined;

				void syncAuth(session, version).catch((error) => {
					console.error("Errore sincronizzazione autenticazione:", error);
				});
			}, 0);
		});

		return () => {
			// Impedisce ai caricamenti pendenti di aggiornare $user
			// o avviare redirect dopo la distruzione del componente.
			authVersion++;

			if (authTimer !== undefined) {
				clearTimeout(authTimer);
			}

			subscription.unsubscribe();
			$user = null;

			mediaQuery.removeEventListener("change", syncTheme);
			window.removeEventListener("storage", syncTheme);
			window.removeEventListener("theme-changed", syncTheme);
		};
	});

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	{@html pwaWebManifest}

	<script
		async
		src="https://cdn.jsdelivr.net/npm/pwacompat"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="shell" class:isSignedIn class:fullBleedBottom={hideTabBar}>
	{@render children()}
	{#if isSignedIn && !hideTabBar}
		<Nav />
	{/if}
</div>

<div id="modal-portal-target"></div>

<style>
	.shell {
		max-width: 960px;
		margin: 0 auto;
	}

	.shell.isSignedIn {
		padding: calc(0.75rem + env(safe-area-inset-top, 0px)) var(--page-padding)
			calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px));
		overflow-y: auto;
		height: 100%;
		-webkit-overflow-scrolling: touch;
	}

	.shell.isSignedIn.fullBleedBottom {
		padding-bottom: env(safe-area-inset-bottom, 0px);
	}

	@media (min-width: 600px) {
		.shell.isSignedIn {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
		}
	}
</style>

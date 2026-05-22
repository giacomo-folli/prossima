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

	let pwaWebManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");
	let isSignedIn = $state(false);

	const hideTabBar = $derived(page.url.pathname.includes("/training"));

	onMount(() => {
		if (pwaInfo) {
			import("virtual:pwa-register").then(({ registerSW }) => {
				registerSW({ immediate: true });
			});
		}

		const privRoutes = [
			"/analytics",
			"/training",
			"/settings",
			"/exercises",
			"/home",
		];

		const handleAuthRedirect = async (session: unknown) => {
			const currentRoute = page.url.pathname;
			isSignedIn = !!session;
			const protectedRouteActive = privRoutes.some((r) =>
				currentRoute.includes(r),
			);

			if (!isSignedIn && protectedRouteActive) goto(resolve("/auth"));
			else if (isSignedIn && currentRoute.includes("/auth")) {
				await sessions.init();
				goto(resolve("/home"));
			} else if (isSignedIn) {
				await sessions.init();
			}
		};

		supabase.auth.getSession().then(({ data: { session } }) => {
			handleAuthRedirect(session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			handleAuthRedirect(session);
		});

		return () => {
			subscription.unsubscribe();
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

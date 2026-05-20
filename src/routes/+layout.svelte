<script lang="ts">
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";
	import { pwaInfo } from "virtual:pwa-info";
	import { onMount, type Snippet } from "svelte";
	import { supabase } from "$lib/supabase";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";

	let pwaWebManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");
	let isSignedIn = $state(false);

	onMount(() => {
		if (pwaInfo) {
			import("virtual:pwa-register").then(({ registerSW }) => {
				registerSW({ immediate: true });
			});
		}

		const privRoutes = ["/analytics", "/training", "/settings", "/exercises"];

		const handleAuthRedirect = (session: unknown) => {
			const currentRoute = page.url.pathname;
			isSignedIn = !!session;
			const protectedRouteActive = privRoutes.some((r) =>
				currentRoute.includes(r),
			);

			if (!isSignedIn && protectedRouteActive) goto(resolve("/auth"));
			else if (isSignedIn && currentRoute.includes("/auth"))
				goto(resolve("/training"));
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
	<!-- Inietta il tag del manifest generato da Vite -->
	{@html pwaWebManifest}

	<script
		async
		src="https://cdn.jsdelivr.net/npm/pwacompat"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="shell" class:isSignedIn>
	{#if isSignedIn}
		<Nav />
	{/if}
	{@render children()}
</div>

<style>
	.shell {
		max-width: 960px;
		margin: 0 auto;
	}

	.shell.isSignedIn {
		padding: 1.25rem 1rem 4rem;
		overflow-y: auto;
		height: 100%;
		-webkit-overflow-scrolling: touch;
	}

	@media (min-width: 600px) {
		.shell {
			padding: 2rem 1.5rem 4rem;
		}
	}
</style>

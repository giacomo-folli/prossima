<script lang="ts">
	import { resolve } from "$app/paths";
	import { sessions } from "$lib/stores/sessions";
	import { DateTime } from "luxon";

	const todayEexercise = $derived(
		$sessions.find(
			(s) => DateTime.fromISO(s.completed_at).diff(DateTime.now()).days === 0,
		),
	);

	$effect(() => console.log(todayEexercise));
</script>

<section class="cta-card">
	<h2 class="cta-title">Inizia sessione</h2>

	{#if todayEexercise}
		<p class="cta-sub">Esercizio di oggi completato. Adesso riposo!</p>
	{:else}
		<p class="cta-sub">Inizia il primo esercizio di oggi.</p>
		<a href={resolve("/exercises")} class="btn btn--secondary cta-btn">
			<i class="ti ti-dumbbell"></i>
			Vai agli esercizi
		</a>
	{/if}
</section>

<style>
	.cta-card {
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem; /* Increased padding for a more premium feel */
		border-radius: 24px; /* Smoother, more modern corners */

		/* 1. Dynamic, multi-stop gradient for a smoother transition */
		background: linear-gradient(
			135deg,
			hsl(170, 80%, 25%) 0%,
			/* Deep teal */ hsl(160, 70%, 40%) 50%,
			/* Rich emerald */ hsl(150, 60%, 70%) 100% /* Soft mint highlight */
		);

		/* 2. Layered shadow for depth and a glowing effect */
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05),
			0 20px 40px -10px hsla(160, 70%, 30%, 0.3); /* Colored "glow" shadow */

		/* Ensure all text inside defaults to white for high contrast */
		color: #ffffff;
	}

	.cta-title {
		margin: 0;
		font-size: 1.5rem; /* Slightly larger */
		font-weight: 800; /* Extra bold */
		letter-spacing: -0.03em;
		/* Subtle text shadow lifts the title off the gradient */
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.cta-sub {
		margin: 0;
		font-size: 0.9375rem;
		/* Use a semi-translucent white rather than a gray variable for better blending */
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.5;
		max-width: 90%; /* Prevents text from crowding the edge */
	}

	.cta-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem; /* Space between icon and text */
		text-decoration: none;
		width: 100%;
		padding: 1rem 1.25rem; /* More substantial button height */
		font-size: 1rem;
		font-weight: 600;
		border-radius: 14px;
		margin-top: 0.5rem;
		transition: all 0.2s ease;
	}

	/* Specific styling for the primary button against the gradient */
	.btn--primary.cta-btn {
		background-color: #ffffff;
		color: hsl(170, 80%, 20%); /* Dark green text for readability */
	}

	.btn--primary.cta-btn:active {
		background-color: rgba(255, 255, 255, 0.9);
		transform: scale(0.98);
	}

	/* Styling for the secondary button against the gradient */
	.btn--secondary.cta-btn {
		background-color: rgba(255, 255, 255, 0.15);
		color: #ffffff;
		backdrop-filter: blur(4px); /* Glassmorphism effect */
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn--secondary.cta-btn:active {
		background-color: rgba(255, 255, 255, 0.25);
		transform: scale(0.98);
	}
</style>

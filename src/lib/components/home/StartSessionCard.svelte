<script lang="ts">
	import { resolve } from "$app/paths";
	import { sessions } from "$lib/stores/sessions";
	import { DateTime } from "luxon";
	import Icon from "../Icon.svelte";

	const todayEexercise = $derived(
		$sessions.find((s) => {
			const then = DateTime.fromISO(s.completed_at).toObject();
			const now = DateTime.now().toObject();
			return (
				then.day === now.day &&
				then.month === now.month &&
				then.year === now.year
			);
		}),
	);
</script>

<section class="cta-card">
	<h2 class="cta-title">Inizia sessione</h2>

	{#if todayEexercise}
		<p class="cta-sub">Esercizio di oggi completato. Adesso riposo!</p>
	{:else}
		<p class="cta-sub">Inizia il primo esercizio di oggi.</p>
		<a href={resolve("/training")} class="btn cta-btn">
			<Icon name="dumbbell" size={20} />
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
		padding: 24px;
		border-radius: 20px;
		background: linear-gradient(135deg, #2D6A4F 0%, #40916C 100%);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05),
			0 20px 40px -10px rgba(45, 106, 79, 0.3);
		color: #ffffff;
	}

	.cta-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.cta-sub {
		margin: 0;
		font-size: 0.9375rem;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.5;
		max-width: 90%;
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		text-decoration: none;
		width: 100%;
		height: 50px;
		background-color: #ffffff;
		color: #2d6a4f;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 12px;
		margin-top: 0.5rem;
		transition: opacity 150ms ease, transform 150ms ease;
	}

	.cta-btn:active {
		opacity: 0.9;
		transform: scale(0.98);
	}
</style>

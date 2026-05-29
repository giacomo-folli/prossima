<script lang="ts">
	import { resolve } from "$app/paths";
	import { sessions } from "$lib/stores/sessions";
	import { DateTime } from "luxon";
	import Icon from "../Icon.svelte";

	const recentSessions = $derived(
		$sessions
			.slice(0, 5)
			.map((s) => ({
				id: s.id,
				title: s.exercises.map((e) => e.name).join(" - "),
				exercisesCount: s.exercises.length,
				date: DateTime.fromISO(s.completed_at).toFormat("LLL d"),
			})),
	);
</script>

<section class="recent-section">
	<p class="ios-section-label">Recenti</p>

	<div class="session-list">
		{#each recentSessions as session (session.id)}
			<a href={resolve("/training/[id]", { id: session.id ?? "" })} class="session-card ios-card ios-card--tappable">
				<div class="card-left">
					<h3 class="session-name">{session.date}</h3>
					<span class="session-meta">
						{session.exercisesCount || "-"} Esercizi
					</span>
				</div>
				<div class="card-right">
					<Icon name="chevron-right" size={20} class="chevron" />
				</div>
			</a>
		{/each}
	</div>
</section>

<style>
	.recent-section {
		margin-bottom: 2rem;
		padding: 0 1rem;
	}

	.ios-section-label {
		display: block;
		margin: 0 0 12px;
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--color-muted);
	}

	.session-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.session-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		text-decoration: none;
	}

	.card-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.session-name {
		margin: 0;
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
	}

	.session-meta {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-accent);
	}

	.card-right {
		display: flex;
		align-items: center;
		color: var(--color-muted);
		opacity: 0.6;
	}
</style>

<script lang="ts">
	import { sessions } from "$lib/stores/sessions";
	import { DateTime } from "luxon";

	// Example of deriving formatted data for the recent cards.
	// In a real app, 'is_pr' or 'volume' would come from your backend data.
	const recentSessions = $derived(
		$sessions
			.slice(0, 3) // Grab the latest few
			.map((s) => ({
				id: s.id,
				title: s.exercises.map((e) => e.name).join(" - "),
				exercisesCount: s.exercises.length,
				date: DateTime.fromISO(s.completed_at).toFormat("LLL d"),
			})),
	);
</script>

<section class="recent-section">
	<p class="ios-section-label">Recent</p>

	<div class="session-list">
		{#each recentSessions as session (session.id)}
			<div class="session-card">
				<div class="card-left">
					<h3 class="session-name">{session.date}</h3>
					<span class="session-meta"
						>{session.exercisesCount || "-"} Exercises</span
					>
					<!-- <span class="session-meta">{session.title || "-"}</span> -->
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.recent-section {
		margin-bottom: 2rem;
	}

	.session-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem; /* Space between cards */
	}

	.session-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #f8fafc; /* Very light gray/slate */
		border: 1px solid #e2e8f0;
		border-radius: 1.5rem; /* Large border radius for the pill shape */
		padding: 1.25rem 1.5rem;
	}

	.card-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.session-name {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #0f172a;
	}

	.session-meta {
		font-size: 0.875rem;
		color: #64748b;
	}
</style>

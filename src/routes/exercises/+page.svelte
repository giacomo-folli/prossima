<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import AddExerciseModal from "$lib/components/AddExerciseModal.svelte"; // <-- Added import
	import { exerciseProgress } from "$lib/stores/exercises";
	import Icon from "$lib/components/Icon.svelte";

	let showModal = false;

	function openModal() {
		showModal = true;
	}
</script>

<main class="page">
	<header class="exercises-header">
		<div class="header-row">
			<div>
				<h1 class="large-title">Esercizi</h1>
				<p class="page-subtitle">Il tuo programma di allenamento</p>
			</div>
			<button
				class="add-btn"
				on:click={openModal}
				aria-label="Aggiungi esercizio"
			>
				<Icon name="plus" size={24} />
			</button>
		</div>
	</header>

	{#if $exerciseProgress.length === 0}
		<div class="empty-state">
			<Icon name="mood-puzzled" size={48} class="empty-icon" />
			<h3 class="empty-title">Nessun esercizio</h3>
			<p class="empty-desc">
				Crea il tuo primo esercizio per iniziare ad allenarti!
			</p>
			<button class="btn btn-primary empty-cta" on:click={openModal}>
				Aggiungi esercizio
			</button>
		</div>
	{:else}
		<div class="exercises-grid">
			{#each $exerciseProgress as ex (ex.id)}
				<ExerciseCard
					id={ex.id}
					name={ex.name}
					pct={ex.pct}
					completedCount={ex.completedCount}
					total={ex.total}
					current={ex.current}
					next={ex.next}
					isComplete={ex.isComplete}
				/>
			{/each}
		</div>
	{/if}
</main>

<AddExerciseModal bind:showModal />

<style>
	/* ── Header ── */
	.exercises-header {
		margin-bottom: 1.25rem;
		padding: 0 0.5rem;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	/* ── Add button (FAB) ── */
	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-accent);
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(45, 106, 79, 0.35);
		flex-shrink: 0;
		padding: 0;
		transition:
			opacity 0.15s ease,
			transform 0.12s ease;
	}

	.add-btn:active {
		transform: scale(0.94);
		opacity: 0.9;
	}

	/* ── Grid ── */
	.exercises-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
		padding: 0;
	}

	@media (min-width: 600px) {
		.exercises-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: 12px;
		}
	}

	/* ── Empty State ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 3rem 1.5rem;
		color: var(--color-muted);
	}

	:global(.empty-icon) {
		color: var(--color-text-disabled);
		margin-bottom: 1rem;
	}

	.empty-title {
		margin: 0 0 0.5rem;
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text);
	}

	.empty-desc {
		margin: 0 0 1.5rem;
		font-size: 14px;
		max-width: 260px;
		line-height: 1.5;
	}

	.empty-cta {
		padding: 0.75rem 1.5rem;
		font-size: 15px;
		border-radius: 12px;
	}
</style>

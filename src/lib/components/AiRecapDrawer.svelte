<script lang="ts">
	import Modal from "./Modal.svelte";
	import Icon from "./Icon.svelte";
	import { generateAiRecap, type AiRecapResult } from "$lib/groq";
	import { user } from "$lib/stores/user";
	import { sessions } from "$lib/stores/sessions";

	let {
		visible = $bindable(false),
		stats,
		onClose,
	}: { visible: boolean; stats: any[]; onClose: () => void } = $props();

	let loading = $state(false);
	let error = $state(false);
	let recap = $state<AiRecapResult | null>(null);

	// Fetch recap automatically whenever the modal opens
	$effect(() => {
		if (visible) {
			fetchRecap();
		}
	});

	// Fire the close callback parent cleanup event if the bound visibility state drops
	$effect(() => {
		if (!visible) {
			onClose();
		}
	});

	async function fetchRecap() {
		error = false;

		// 1. Check cached recap for today
		const userId = $user?.id || "guest";
		const cacheKey = `prossima_ai_recap_${userId}`;
		const todayStr = new Date().toLocaleDateString("sv"); // 'YYYY-MM-DD'

		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const parsed = JSON.parse(cached);
				if (parsed.date === todayStr && parsed.data) {
					recap = parsed.data;
					loading = false;
					return;
				}
			}
		} catch (e) {
			console.error("Errore lettura cache localStorage:", e);
		}

		// 2. Fetch new recap from AI
		loading = true;

		try {
			await sessions.init();
		} catch (e) {
			console.error("Errore caricamento sessioni:", e);
		}

		const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
		const recentSessionDates = $sessions
			.filter(
				(s) =>
					s.completed_at && new Date(s.completed_at).getTime() >= thirtyDaysAgo,
			)
			.map((s) => new Date(s.completed_at).toLocaleDateString("sv"));

		const result = await generateAiRecap(stats, recentSessionDates);

		if (
			result &&
			result.summary &&
			Array.isArray(result.suggestions) &&
			result.suggestions.length === 2
		) {
			recap = result;
			loading = false;

			try {
				localStorage.setItem(
					cacheKey,
					JSON.stringify({
						date: todayStr,
						data: result,
					}),
				);
			} catch (e) {
				console.error("Errore scrittura cache localStorage:", e);
			}
		} else {
			loading = false;
			error = true;
		}
	}
</script>

<Modal bind:showModal={visible} title="Coaching AI Recap">
	<div slot="body">
		{#if loading}
			<div class="loading-state">
				<div class="skeleton skeleton-summary"></div>
				<h3 class="section-subtitle-skeleton"></h3>
				<div class="skeleton-list">
					<div class="skeleton skeleton-card"></div>
					<div class="skeleton skeleton-card"></div>
					<div class="skeleton skeleton-card"></div>
				</div>
			</div>
		{:else if error}
			<div class="error-state">
				<div class="error-icon-wrap">⚠️</div>
				<p class="error-text">
					Impossibile generare il recap. Controlla la connessione o riprova.
				</p>
				<button class="btn btn--primary retry-btn" onclick={fetchRecap}>
					Riprova
				</button>
			</div>
		{:else if recap}
			<div class="summary-card">
				<div class="summary-header">
					<Icon name="zap" size={18} class="accent-icon" />
					<span class="summary-title">Riepilogo Avanzamento</span>
				</div>
				<p class="summary-text">{recap.summary}</p>
			</div>

			<div class="suggestions-section">
				<h3 class="section-subtitle">3 Consigli del Coach</h3>
				<div class="suggestions-list">
					{#each recap.suggestions as suggestion, i}
						<div class="suggestion-card">
							<div
								class="suggestion-icon-wrap"
								class:icon-0={i === 0}
								class:icon-1={i === 1}
								class:icon-2={i === 2}
							>
								{#if i === 0}
									<Icon name="dumbbell" size={20} />
								{:else if i === 1}
									<Icon name="flame" size={20} />
								{:else}
									<Icon name="list-check" size={20} />
								{/if}
							</div>
							<div class="suggestion-content">
								<span class="suggestion-num">Suggerimento {i + 1}</span>
								<p class="suggestion-text">{suggestion}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Modal>

<style>
	/* Loading Skeleton screen */
	.loading-state {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.skeleton {
		background: var(--color-track);
		border-radius: var(--radius-card);
		animation: pulse 1.5s infinite ease-in-out;
	}

	.skeleton-summary {
		height: 90px;
		width: 100%;
	}

	.section-subtitle-skeleton {
		height: 20px;
		width: 150px;
		background: var(--color-track);
		border-radius: 4px;
		opacity: 0.6;
		margin: 0.5rem 0 0;
		animation: pulse 1.5s infinite ease-in-out;
	}

	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.skeleton-card {
		height: 72px;
		width: 100%;
	}

	@keyframes pulse {
		0% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.8;
		}
		100% {
			opacity: 0.4;
		}
	}

	/* Error State */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		text-align: center;
		gap: 1rem;
	}

	.error-icon-wrap {
		font-size: 2.5rem;
	}

	.error-text {
		margin: 0;
		font-size: 15px;
		color: var(--color-muted);
		line-height: 1.5;
		max-width: 320px;
	}

	.retry-btn {
		padding: 0.6rem 1.8rem;
		font-size: 15px;
	}

	/* Summary Card */
	.summary-card {
		background: var(--color-accent-dim);
		border: 1px solid rgba(82, 183, 136, 0.15);
		border-radius: var(--radius-card);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.summary-header {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--color-accent);
	}

	.summary-title {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.summary-text {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--color-text);
		font-weight: 500;
	}

	/* Suggestions Section */
	.suggestions-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 0.5rem;
	}

	.section-subtitle {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.suggestions-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.suggestion-card {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		padding: 14px 16px;
		display: flex;
		align-items: flex-start;
		gap: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
	}

	.suggestion-icon-wrap {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.suggestion-icon-wrap.icon-0 {
		background: rgba(45, 106, 79, 0.08);
		color: var(--color-accent);
	}

	.suggestion-icon-wrap.icon-1 {
		background: rgba(239, 68, 68, 0.08);
		color: var(--color-danger);
	}

	.suggestion-icon-wrap.icon-2 {
		background: rgba(0, 122, 255, 0.08);
		color: #007aff;
	}

	.suggestion-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.suggestion-num {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-muted);
		letter-spacing: 0.3px;
	}

	.suggestion-text {
		margin: 0;
		font-size: 13.5px;
		line-height: 1.45;
		color: var(--color-text);
		font-weight: 500;
	}
</style>

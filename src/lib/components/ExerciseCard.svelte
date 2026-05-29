<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Step } from "$lib/types";
	import ProgressBar from "./ProgressBar.svelte";

	let {
		id,
		name,
		pct,
		completedCount,
		total,
		current,
		next,
		isComplete,
	}: {
		id: string;
		name: string;
		pct: number;
		completedCount: number;
		total: number;
		current: Pick<Step, "description"> | null;
		next: Pick<Step, "description"> | null;
		isComplete: boolean;
	} = $props();
</script>

<a
	href={resolve("/exercises/[id]", { id })}
	class="card ios-card ios-card--tappable"
	class:done={isComplete}
>
	<div class="card-header">
		<span class="name">{name}</span>
		<span class="pct" class:green={pct > 0}>{pct}%</span>
	</div>

	<ProgressBar {pct} />

	<div class="card-body">
		{#if isComplete}
			<p class="step-label complete-label">✓ Completato</p>
		{:else}
			<p class="step-label">
				<span class="step-meta">Ora</span>
				<span class="step-value"> {current?.description ?? "—"}</span>
			</p>
			{#if next}
				<p class="step-label next">
					<span class="step-meta">Prossimo</span>
					<span class="step-value"> {next.description} </span>
				</p>
			{/if}
		{/if}
	</div>

	<div class="card-footer">
		<span class="count">{completedCount}/{total} step</span>
	</div>
</a>

<style>
	.card {
		display: block;
		width: 100%;
		box-sizing: border-box;
		text-decoration: none;
		color: inherit;
		padding: 16px;
	}

	.card.done {
		opacity: 0.6;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 12px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		min-width: 0;
	}

	.name {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		letter-spacing: -0.01em;
	}

	.pct {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.pct.green {
		color: var(--color-accent);
		font-weight: 600;
	}

	.card-body {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.step-label {
		margin: 0;
		font-size: 15px;
		color: var(--color-text);
		display: flex;
		gap: 8px;
		align-items: baseline;
	}

	.step-value {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
		font-weight: 500;
	}

	.step-label.next {
		color: var(--color-muted);
	}

	.step-label.next .step-value {
		font-weight: 400;
	}

	.step-meta {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		font-weight: 600;
		color: var(--color-muted);
		min-width: 3.5rem;
		flex-shrink: 0;
	}

	.complete-label {
		color: var(--color-accent);
		font-weight: 600;
		font-size: 15px;
	}

	.card-footer {
		margin-top: 12px;
	}

	.count {
		font-size: 13px;
		font-weight: 400;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
	}
</style>

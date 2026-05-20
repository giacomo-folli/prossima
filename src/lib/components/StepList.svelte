<script lang="ts">
	import type { Step } from "../types";

	let {
		steps,
		current_step_index,
	}: { steps: Step[]; current_step_index: number } = $props();

	const orderedSteps = $derived(
		steps.toSorted((a, b) => a.step_index - b.step_index),
	);
</script>

<ol class="step-list">
	{#each orderedSteps as step, i}
		{@const state = step.completed
			? "completed"
			: i === current_step_index
				? "current"
				: "future"}
		<li class="step {state}">
			<span class="step-icon">
				{#if state === "completed"}
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M2 6l3 3 5-5"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				{:else if state === "current"}
					<span class="dot-current"></span>
				{:else}
					<span class="dot-future"></span>
				{/if}
			</span>
			<span class="step-text">{step.description}</span>
			{#if step.completed_at}
				<span class="step-date"
					>{new Date(step.completed_at).toLocaleDateString("it-IT", {
						day: "2-digit",
						month: "short",
					})}</span
				>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.step-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.step {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0;
		border-bottom: 1px solid var(--color-border);
		transition: background 0.1s;
	}

	.step:last-child {
		border-bottom: none;
	}

	.step-icon {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.step.completed .step-icon {
		background: var(--color-accent);
		color: white;
	}

	.step.current .step-icon {
		background: var(--color-accent-dim);
		border: 1.5px solid var(--color-accent);
	}

	.step.future .step-icon {
		background: var(--color-track);
	}

	.dot-current {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-accent);
	}

	.dot-future {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-muted);
		opacity: 0.4;
	}

	.step-text {
		flex: 1;
		font-size: 0.9rem;
	}

	.step.completed .step-text {
		color: var(--color-muted);
		text-decoration: line-through;
		text-decoration-color: var(--color-muted);
	}

	.step.current .step-text {
		font-weight: 600;
		color: var(--color-text);
	}

	.step.future .step-text {
		color: var(--color-muted);
		opacity: 0.6;
	}

	.step-date {
		font-size: 0.7rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>

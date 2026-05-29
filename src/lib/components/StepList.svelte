<script lang="ts">
	import type { Step } from "../types";
	import Icon from "./Icon.svelte";

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
			<span class="step-icon-container">
				{#if state === "completed"}
					<Icon name="circle-check" size={22} class="icon-completed" />
				{:else if state === "current"}
					<Icon name="circle-dot" size={22} class="icon-current" />
				{:else}
					<Icon name="circle" size={22} class="icon-future" />
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
		min-height: 52px;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border);
		transition: background 0.1s;
	}

	.step:last-child {
		border-bottom: none;
	}

	.step-icon-container {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-completed {
		color: var(--color-accent);
	}

	.icon-current {
		color: var(--color-accent);
	}

	.icon-future {
		color: var(--color-text-disabled);
	}

	.step-text {
		flex: 1;
		font-size: 15px;
		color: var(--color-text);
		line-height: 1.4;
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
		color: var(--color-text-disabled);
	}

	.step-date {
		font-size: 11px;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>

<script lang="ts">
	import Modal from "./Modal.svelte";
	import Icon from "./Icon.svelte";
	import { exercises } from "$lib/stores/exercises";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import type { Exercise } from "$lib/types";
	import posthog from "posthog-js";

	let {
		showModal = $bindable(false),
		exercise,
	}: { showModal: boolean; exercise: Exercise | undefined } = $props();

	function cancelDelete() {
		showModal = false;
	}

	function deleteExercise() {
		if (!exercise) return;

		posthog.capture("exercise_deleted", {
			exercise_id: exercise.id,
			exercise_name: exercise.name,
		});

		exercises.remove(exercise.id);
		showModal = false;
		goto(resolve("/exercises"));
	}
</script>

<Modal bind:showModal title="">
	<div slot="body" class="confirm-body">
		<div class="confirm-icon">
			<Icon name="trash" size={24} />
		</div>
		<h2 id="confirm-title">Elimina esercizio</h2>
		<p class="confirm-desc">
			Vuoi eliminare <strong>{exercise?.name}</strong>? Questa azione non può
			essere annullata.
		</p>
	</div>

	<div slot="footer" class="confirm-actions">
		<button class="btn btn--danger confirm-delete-btn" onclick={deleteExercise}>
			Elimina
		</button>
		<button
			class="btn btn--secondary confirm-cancel-btn"
			onclick={cancelDelete}
		>
			Annulla
		</button>
	</div>
</Modal>

<style>
	.confirm-body {
		padding: 0.5rem 0.5rem 0;
		text-align: center;
	}

	.confirm-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: rgba(255, 59, 48, 0.12);
		color: var(--color-danger);
		font-size: 1.4rem;
		margin-bottom: 0.85rem;
	}

	.confirm-body h2 {
		margin: 0 0 0.5rem;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.confirm-desc {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-muted);
		line-height: 1.5;
	}

	.confirm-desc strong {
		color: var(--color-text);
		font-weight: 600;
	}

	.confirm-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	:global(.confirm-actions .btn) {
		width: 100% !important;
		text-align: center;
		border-radius: var(--radius-card);
		padding: 0.8rem;
		font-size: 0.95rem;
	}
</style>

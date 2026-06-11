<script lang="ts">
	import Icon from "$lib/components/Icon.svelte";

	export let showModal = false;
	export let title = "";

	function closeModal() {
		showModal = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
			closeModal();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && showModal) closeModal();
	}
</script>

<svelte:window on:keydown={handleKeydown} />
<svelte:body class:no-scroll={showModal} />

{#if showModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div
			class="modal ios-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div class="drag-handle"></div>

			<div class="modal-header">
				<h2 id="modal-title">{title}</h2>
				<button class="close-btn" on:click={closeModal} aria-label="Chiudi">
					<Icon name="x" size={18} />
				</button>
			</div>

			<div class="modal-body">
				<slot name="body" />
			</div>

			<div class="modal-footer">
				<slot name="footer" {closeModal} />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 100;
		animation: fade-in 0.18s ease;
	}

	@media (min-width: 520px) {
		.modal-backdrop {
			align-items: center;
			padding: 1rem;
		}
	}

	.modal {
		width: 100%;
		max-width: 480px;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		padding: 0;
		box-shadow: 0 -12px 44px rgba(0, 0, 0, 0.24);
		animation: slide-up 0.24s cubic-bezier(0.32, 1.2, 0.6, 1);
		overflow: hidden;
		font-size: 16px;
	}

	@media (min-width: 520px) {
		.modal {
			border-radius: var(--radius-lg);
			box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
			animation: pop-in 0.22s cubic-bezier(0.32, 1.2, 0.6, 1);
		}
	}

	.drag-handle {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--color-track);
		margin: 0.75rem auto 0;
	}

	@media (min-width: 520px) {
		.drag-handle {
			display: none;
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.125rem 0;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 50%;
		background: var(--color-track);
		color: var(--color-muted);
		font-size: 0.95rem;
		padding: 0;
		transition: opacity 0.15s;
	}

	.close-btn:hover {
		opacity: 0.7;
	}

	.modal-body {
		padding: 1rem 1.125rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-footer {
		display: flex;
		gap: 0.6rem;
		padding: 0 1.125rem 1.25rem;
	}

	:global(.modal-footer .btn) {
		flex: 1;
		text-align: center;
		border-radius: var(--radius-card);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-up {
		from {
			transform: translateY(56px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes pop-in {
		from {
			transform: scale(0.93);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>

<script lang="ts">
	import { resolve } from "$app/paths";
	import Icon from "../Icon.svelte";
</script>

<a href={resolve("/history")} class="cta-btn">
	<Icon name="clock" size={20} />
	Sessioni Passate
</a>

<style>
	.cta-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		width: 100%;
		height: 56px;
		border-color: linear-gradient(135deg, #ccc 0%, #bbb 50%, #ccc 100%);
		color: #444;
		font-size: 1.0625rem;
		font-weight: 700;
		border-radius: 16px;
		text-decoration: none;
		margin-bottom: 1.5rem;
		box-shadow:
			0 4px 12px rgba(45, 106, 79, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.06);
		transition: opacity 150ms ease, transform 150ms ease;
	}

	:global(.dark) .cta-btn {
		border-color: linear-gradient(135deg, #444 0%, #333 50%, #444 100%);
		background-color: #121;
		color: #fff;
	}

	.cta-btn:active {
		opacity: 0.9;
		transform: scale(0.98);
	}
</style>

<script lang="ts">
	let { pct = 0, compact = false }: { pct?: number; compact?: boolean } =
		$props();
</script>

<div class="progress-track" class:compact>
	<div class="progress-fill" style="width: {pct}%"></div>
</div>

<style>
	.progress-track {
		width: 100%;
		height: 4px;
		background: var(--color-track);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-track.compact {
		height: 3px;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 2px;
		transition: width 0.4s ease;
	}
</style>

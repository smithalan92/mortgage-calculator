<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { _chartConfig } from '$lib/store';
	Chart.register(...registerables);

	let portfolio: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const ctx = portfolio.getContext('2d');
		chart = new Chart(ctx!, $_chartConfig);
	});

	const updateChart = (...args: any) => {
		if (!chart) return;
		chart.options = $_chartConfig.options!;
		chart.data = $_chartConfig.data;
		chart.update();
	};

	$: updateChart($_chartConfig);
</script>

<div class="chart-container">
	<canvas bind:this={portfolio} width={400} height={400} />
</div>

<style>
	.chart-container {
		height: 500px;
		width: 100%;
	}
</style>

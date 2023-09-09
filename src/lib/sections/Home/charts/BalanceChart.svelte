<script lang="ts">
	import { getBalanceChartConfig } from '$lib/chartConfigs';
	import { _monthlyPayments, _mortgageBalance } from '$lib/store';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	Chart.register(...registerables);

	let portfolio: HTMLCanvasElement;
	let chart: Chart;

	$: chartConfig = getBalanceChartConfig($_mortgageBalance, $_monthlyPayments);

	onMount(() => {
		const ctx = portfolio.getContext('2d');
		chart = new Chart(ctx!, chartConfig);
	});

	const updateChart = (...args: any) => {
		if (!chart) return;
		chart.options = chartConfig.options!;
		chart.data = chartConfig.data;
		chart.update();
	};

	$: updateChart(chartConfig);
</script>

<div class="chart-container">
	<canvas bind:this={portfolio} width={400} height={400} />
</div>

<style>
	.chart-container {
		padding: 24px;
		height: 500px;
		width: 100%;
	}
</style>

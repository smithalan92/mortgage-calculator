<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const NUMBER_OF_COLUMNS = 4;

	const MONTHS = [
		'Jan',
		'Feb',
		'March',
		'April',
		'May',
		'June',
		'July',
		'Aug',
		'Sept',
		'Oct',
		'Nov',
		'Dec'
	];

	const ROWS = Math.max(MONTHS.length / NUMBER_OF_COLUMNS);

	const onClickMonth = (month: string) => {
		dispatch('selectMonth', month);
	};
</script>

<div class="flex flex-col px-2">
	{#each { length: ROWS } as _, i}
		<div class="flex">
			{#each { length: NUMBER_OF_COLUMNS } as _, j}
				{@const idx = i === 0 ? 0 + j : i * NUMBER_OF_COLUMNS + j}
				{@const month = MONTHS[idx]}
				<button class="month" on:click={() => onClickMonth(month)}>{month}</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.month {
		@apply w-[100px] p-2 cursor-pointer text-center border border-solid border-gray-200;
	}

	.month:first-child {
	}

	.month:hover {
		@apply bg-gray-200;
	}
</style>

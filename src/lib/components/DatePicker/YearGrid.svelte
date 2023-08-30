<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let startYear: number;
	export let numberOfYearsToDisplay: number;
	const numberOfColumns = 4;

	const dispatch = createEventDispatcher();

	function getYearRange(startYear: number) {
		return new Array(numberOfYearsToDisplay).fill(1).reduce<number[]>((acc, __, idx) => {
			if (idx === 0) acc[idx] = startYear;
			else acc[idx] = acc[idx - 1] + 1;
			return acc;
		}, []);
	}

	$: yearRange = getYearRange(startYear);
	$: rowCount = Math.ceil(yearRange.length / 4);

	const onClickYear = (year: number) => {
		dispatch('selectYear', year);
	};
</script>

<div class="flex flex-col px-2">
	{#each { length: rowCount } as _, i}
		<div class="flex">
			{#each { length: numberOfColumns } as _, j}
				{@const idx = i === 0 ? 0 + j : i * numberOfColumns + j}
				{@const year = yearRange[idx]}
				<button class="year" on:click={() => onClickYear(year)}>{year}</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.year {
		@apply w-[100px] p-2 cursor-pointer text-center border border-solid border-gray-200;
	}

	.year:first-child {
	}

	.year:hover {
		@apply bg-gray-200;
	}
</style>

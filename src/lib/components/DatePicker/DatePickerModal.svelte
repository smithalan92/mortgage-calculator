<script lang="ts">
	import type { ContentAction } from 'svelte-floating-ui';
	import { createEventDispatcher } from 'svelte';
	import clickOutside from '$lib/clickOutside';
	import MonthGrid from './MonthGrid.svelte';
	import YearGrid from './YearGrid.svelte';
	// @ts-ignore
	import LeftArrow from '$lib/images/left-arrow.svg?component';
	// @ts-ignore
	import RightArrow from '$lib/images/right-arrow.svg?component';
	// @ts-ignore
	import GridIcon from '$lib/images/grid.svg?component';
	import { format } from 'date-fns';

	export let floatingContent: ContentAction;

	const dispatch = createEventDispatcher();

	const YEAR_PICKER_YEARS_TO_DISPLAY = 12;

	let currentYearSelected = new Date().getFullYear();
	let isYearView = false;

	let yearPickerStartYear = currentYearSelected;

	$: selectedYearTitle = isYearView
		? `${yearPickerStartYear} - ${yearPickerStartYear + YEAR_PICKER_YEARS_TO_DISPLAY - 1}`
		: currentYearSelected;

	const onClickPrevious = () => {
		if (isYearView) {
			yearPickerStartYear = yearPickerStartYear - YEAR_PICKER_YEARS_TO_DISPLAY;
		} else {
			currentYearSelected -= 1;
		}
	};

	const onClickNext = () => {
		if (isYearView) {
			yearPickerStartYear = yearPickerStartYear + YEAR_PICKER_YEARS_TO_DISPLAY;
		} else {
			currentYearSelected += 1;
		}
	};

	const onClickOutside = () => {
		dispatch('close');
	};

	const toggleGrid = () => {
		isYearView = !isYearView;
		yearPickerStartYear = currentYearSelected;
	};

	const onSelectMonth = (event: CustomEvent<string>) => {
		const monthName = event.detail;
		const selectedValue = format(new Date(`${currentYearSelected}-${monthName}`), 'yyyy-MM');

		dispatch('selectDate', selectedValue);
	};

	const onSelectYear = (event: CustomEvent<number>) => {
		currentYearSelected = event.detail;
		isYearView = false;
	};
</script>

<div
	class="rounded border border-solid border-gray-600 absolute pb-4 bg-white z-[9999] flex flex-col"
	use:floatingContent
	use:clickOutside={onClickOutside}
>
	<div class="flex items-center justify-center py-2">
		<button class="hover:opacity-50 p-1 cursor-pointer" on:click={onClickPrevious}>
			<LeftArrow class="w-4 h-4" />
		</button>
		<span class="mx-4 w-28 text-center">{selectedYearTitle}</span>
		<button class="hover:opacity-50 p-1 cursor-pointer" on:click={onClickNext}>
			<RightArrow class="w-4 h-4" />
		</button>
		<button class="ml-2 hover:opacity-50 p-1 cursor-pointer" on:click={toggleGrid}>
			<GridIcon class="w-4 h-4" />
		</button>
	</div>
	<div>
		{#if !isYearView}
			<MonthGrid on:selectMonth={onSelectMonth} />
		{/if}
		{#if isYearView}
			<YearGrid
				numberOfYearsToDisplay={YEAR_PICKER_YEARS_TO_DISPLAY}
				startYear={yearPickerStartYear}
				on:selectYear={onSelectYear}
			/>
		{/if}
	</div>
</div>

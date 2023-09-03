<script lang="ts">
	import { offset, flip, shift } from 'svelte-floating-ui/dom';
	import { createFloatingActions } from 'svelte-floating-ui';
	import DatePickerModal from './DatePickerModal.svelte';
	import { format } from 'date-fns';

	export let value: string;
	export let inputClass: string = '';

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'absolute',
		placement: 'top',
		middleware: [offset(4), flip(), shift()],
		autoUpdate: {
			ancestorResize: true,
			elementResize: true
		}
	});

	let showTooltip: boolean = false;

	const onClickInput = (event: MouseEvent) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		showTooltip = true;
	};

	const onClose = () => {
		showTooltip = false;
	};

	const onSelectDate = (event: CustomEvent<string>) => {
		value = event.detail;
		onClose();
	};

	$: displayValue = value ? format(new Date(value), 'MMMM yyyy') : '';
</script>

<div>
	<input
		class={inputClass}
		placeholder="Select Date"
		value={displayValue}
		on:click={onClickInput}
		use:floatingRef
	/>
	{#if showTooltip}
		<DatePickerModal {floatingContent} on:selectDate={onSelectDate} on:close={onClose} />
	{/if}
</div>

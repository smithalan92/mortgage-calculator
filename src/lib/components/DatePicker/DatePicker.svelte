<script lang="ts">
	import { offset, flip, shift } from 'svelte-floating-ui/dom';
	import { createFloatingActions } from 'svelte-floating-ui';
	import DatePickerModal from './DatePickerModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { format } from 'date-fns';

	export let value: string;

	const dispatch = createEventDispatcher();

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'absolute',
		placement: 'top',
		middleware: [offset(4), flip(), shift()],
		autoUpdate: {
			// or false to disable everything
			ancestorResize: false,
			elementResize: false
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

<div class="relative">
	<input placeholder="Select Date" value={displayValue} on:click={onClickInput} use:floatingRef />
	{#if showTooltip}
		<DatePickerModal {floatingContent} on:selectDate={onSelectDate} on:close={onClose} />
	{/if}
</div>

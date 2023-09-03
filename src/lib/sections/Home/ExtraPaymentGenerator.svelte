<script lang="ts">
	import { slide } from 'svelte/transition';
	// @ts-ignore
	import CloseIcon from '$lib/images/close.svg?component';
	import { createEventDispatcher } from 'svelte';
	import DatePicker from '$lib/components/DatePicker/DatePicker.svelte';
	import { addMonths, addYears, format, isBefore, isSameMonth, isSameYear } from 'date-fns';
	import type { ExtraOneOffRepayment, ExtraOneOffRepaymentData } from '$lib/store';

	interface FrequencyUnit {
		value: 'month' | 'year';
		text: (frequency: number) => string;
	}

	const frequencyUnits: FrequencyUnit[] = [
		{ value: 'month', text: (frequency: number) => `Month${frequency > 1 ? 's' : ''}` },
		{ value: 'year', text: (frequency: number) => `Year${frequency > 1 ? 's' : ''}` }
	];

	let selectedFrequency = 1;
	let selectedFrequencyUnit: FrequencyUnit['value'] = frequencyUnits[0].value;
	let selectedStartMonthYear = format(new Date(), 'yyyy-MM');
	let selectedEndMonthYear = format(addYears(new Date(), 1), 'yyyy-MM');
	let paymentAmount = 100;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function generatePayments() {
		const data: ExtraOneOffRepayment[] = [];
		let addUnit = selectedFrequencyUnit === 'month' ? addMonths : addYears;

		let currentDate = new Date(selectedStartMonthYear);
		let endDate = new Date(selectedEndMonthYear);

		while (
			isBefore(currentDate, endDate) ||
			(isSameMonth(currentDate, endDate) && isSameYear(currentDate, endDate))
		) {
			const now = format(currentDate, 'yyyy-MM');
			data.push({
				id: crypto.randomUUID(),
				date: now,
				amount: paymentAmount
			});

			currentDate = addUnit(currentDate, selectedFrequency);
		}

		dispatch('generatedPayments', data);
	}
</script>

<div class="w-screen h-screen absolute bg-black/30 top-0 left-0 flex items-center justify-center">
	<div
		class="w-[450px] bg-white flex flex-col shadow border border-solid border-gray-700"
		in:slide={{ axis: 'y', duration: 300 }}
		out:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="w-full flex justify-between px-4 py-2 relative bg-black text-white">
			<h1 class="text-lg font-bold">Generate Extra Repayments</h1>
			<button class="absolute top-0 right-0 py-3 px-4 hover:opacity-50" on:click={close}>
				<CloseIcon class="w-[20px] h-[20px] fill-white" />
			</button>
		</div>
		<div class="m-t-4 flex flex-col items-center">
			<div class="text-xl mt-4">Add an extra payment every</div>
			<div class="flex mt-6">
				<input
					class="w-24 text-lg font-bold outline-none border border-gray-300 border solid inline rounded pl-2 py-1 text-center"
					type="number"
					min="1"
					bind:value={selectedFrequency}
				/>

				<select
					class="ml-8 text-lg font-bold w-32"
					name="cars"
					id="cars"
					size="1"
					bind:value={selectedFrequencyUnit}
				>
					{#each frequencyUnits as frequency}
						<option value={frequency.value}>
							{frequency.text(selectedFrequency)}
						</option>
					{/each}
				</select>
			</div>
			<div class="mt-8 flex items-center">
				<span class="text-xl mr-4">from</span>
				<DatePicker
					bind:value={selectedStartMonthYear}
					inputClass="text-center border border-gray-300 border-solid rounded w-52 p-2 font-bold text-lg inline"
				/>
			</div>
			<div class="mt-8 flex items-center">
				<span class="text-xl mr-4">until</span>
				<DatePicker
					bind:value={selectedEndMonthYear}
					inputClass="text-center border border-gray-300 border-solid rounded w-52 p-2 font-bold text-lg inline"
				/>
			</div>
			<div class="mt-8 flex items-center">
				<span class="text-xl mr-4">for the amount of</span>
				<div
					class="text-lg font-bold leading-7 border border-r-0 border-gray-300 h-10 pt-1 pl-2 rounded-l-lg"
				>
					€
				</div>
				<input
					class="w-24 text-xl font-bold outline-none border border-l-0 border-gray-300 border solid inline rounded-r-lg pl-1 py-1 h-10 text-center"
					type="number"
					min="1"
					bind:value={paymentAmount}
				/>
			</div>
			<div class="flex items-center mt-8 pb-8">
				<button class="bg-green-600 text-white px-4 py-2" on:click={generatePayments}
					>Generate Payments</button
				>
			</div>
		</div>
	</div>
</div>

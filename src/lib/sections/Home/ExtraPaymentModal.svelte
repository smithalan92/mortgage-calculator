<script lang="ts">
	import { slide } from 'svelte/transition';
	import {
		_extraOneOffRepayments,
		type ExtraOneOffRepayment,
		type ExtraOneOffRepaymentData
	} from '$lib/store';
	import { createEventDispatcher } from 'svelte';
	import { clone } from 'remeda';
	// @ts-ignore
	import CloseIcon from '$lib/images/close.svg?component';
	import DatePicker from '$lib/components/DatePicker/DatePicker.svelte';

	function isPaymentDataValid(payments: ExtraOneOffRepayment[]) {
		for (const [idx, payment] of payments.entries()) {
			if (idx === payments.length - 1 && payments.length > 1) {
				if ((payment.date && !payment.amount) || (payment.amount && !payment.date)) {
					return false;
				}
			} else {
				if (!payment.date || payment.amount <= 0) {
					return false;
				}
			}
		}
		return true;
	}

	function getEmptyPaymentRecord(): ExtraOneOffRepayment {
		return { id: crypto.randomUUID(), date: '', amount: 0 };
	}

	let paymentsToAdd: ExtraOneOffRepayment[] = Object.values($_extraOneOffRepayments).length
		? clone(Object.values($_extraOneOffRepayments))
		: [getEmptyPaymentRecord()];

	$: canSaveRepayments = isPaymentDataValid(paymentsToAdd);

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function addPayment() {
		paymentsToAdd.push(getEmptyPaymentRecord());
	}

	function removePayment(id: string) {
		paymentsToAdd = paymentsToAdd.filter((p) => p.id !== id);
	}

	function savePayments() {
		const data = paymentsToAdd.reduce<ExtraOneOffRepaymentData>((acc, current) => {
			if (!current.amount || !current.date) return acc;

			acc[current.date] = current;
			return acc;
		}, {});

		_extraOneOffRepayments.set(data);
		close();
	}

	$: {
		if (paymentsToAdd.length === 0) {
			addPayment();
		}

		const hasUnfilledPayment = paymentsToAdd.find((p) => !p.amount || !p.date);

		if (!hasUnfilledPayment) addPayment();
	}
</script>

<div class="w-screen h-screen absolute bg-black/30 top-0 left-0 flex items-center justify-center">
	<div
		class="w-[500px] h-[500px] bg-white flex flex-col"
		in:slide={{ axis: 'y', duration: 300 }}
		out:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="w-full flex justify-between px-4 py-2 relative">
			<h1 class="text-lg font-bold">Add Extra Repayments</h1>
			<button class="absolute top-0 right-0 py-3 px-4 hover:opacity-50" on:click={close}>
				<CloseIcon class="w-[20px] h-[20px] fill-black" />
			</button>
		</div>
		<div class="p-4 flex-1 overflow-hidden">
			<div class="h-full overflow-scroll relative">
				<table class="border-collapse w-full relative">
					<thead>
						<th class="sticky top-[-1px] bg-white z-1">Payment Month & Year</th>
						<th class="text-right sticky top-[-1px] bg-white z-1">Payment Amount</th>
						<th class="sticky top-[-1px] bg-white z-1" />
					</thead>
					{#each paymentsToAdd as payment}
						<tr>
							<td>
								<DatePicker bind:value={payment.date} />
							</td>
							<td>
								<input
									class="text-right w-full outline-none"
									type="number"
									bind:value={payment.amount}
								/>
							</td>
							<td
								class="hover:opacity-50 cursor-pointer"
								on:click={() => removePayment(payment.id)}
							>
								<CloseIcon class="w-4 h-4 fill-red-700" />
							</td>
						</tr>
					{/each}
				</table>
			</div>
		</div>
		<div class="p-4 flex justify-end">
			<button class="mr-8 hover:text-gray-500" on:click={close}>Cancel</button>
			<button
				class="text-green-600 hover:text-green-400 disabled:text-gray-400"
				disabled={!canSaveRepayments}
				on:click={savePayments}>Save</button
			>
		</div>
	</div>
</div>

<style>
	td,
	th {
		@apply p-2 border border-solid border-black;
	}
</style>

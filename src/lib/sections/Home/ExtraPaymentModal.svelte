<script lang="ts">
	import { slide } from 'svelte/transition';
	import {
		_extraOneOffRepayments,
		type ExtraOneOffRepayment,
		type ExtraOneOffRepaymentData
	} from '$lib/store';
	import { tick, createEventDispatcher } from 'svelte';
	import { clone } from 'remeda';
	// @ts-ignore
	import CloseIcon from '$lib/images/close.svg?component';
	// @ts-ignore
	import WandIcon from '$lib/images/wand.svg?component';
	import DatePicker from '$lib/components/DatePicker/DatePicker.svelte';
	import ExtraPaymentGenerator from './ExtraPaymentGenerator.svelte';

	function isPaymentDataValid(payments: ExtraOneOffRepayment[]) {
		if (!payments.length) {
			return false;
		}

		// Allow save if no valid data
		if (payments.length === 1 && !payments[0].amount && !payments[0].date) {
			return true;
		}

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

	let shouldShowGenerateModal = false;

	const dispatch = createEventDispatcher();

	let paymentListRef: HTMLDivElement;

	function close() {
		dispatch('close');
	}

	async function addPayment() {
		paymentsToAdd = [...paymentsToAdd, getEmptyPaymentRecord()];

		await tick();

		if (paymentListRef) {
			paymentListRef.scrollTop = paymentListRef.scrollHeight;
		}
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

	function openGenerateModal() {
		shouldShowGenerateModal = true;
	}

	function closeGenerateModal() {
		shouldShowGenerateModal = false;
	}

	function setGeneratedPayments(event: CustomEvent<ExtraOneOffRepayment[]>) {
		paymentsToAdd = event.detail;
		closeGenerateModal();
	}

	function onClickClear() {
		paymentsToAdd = [getEmptyPaymentRecord()];
	}

	$: {
		if (paymentsToAdd.length === 0) {
			addPayment();
		}

		const hasUnfilledPayment = paymentsToAdd.find((p) => !p.amount || !p.date);

		if (!hasUnfilledPayment) addPayment();
	}
</script>

<div class="w-screen h-screen fixed bg-black/30 top-0 left-0 flex items-center justify-center">
	<div
		class="w-[500px] h-[500px] bg-white flex flex-col"
		in:slide={{ axis: 'y', duration: 300 }}
		out:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="w-full flex justify-between items-center px-4 py-2 relative bg-black text-white">
			<h1 class="text-lg font-bold select-none">Add Extra Repayments</h1>
			<div class="flex absolute-top-0">
				<button class="py-3 px-4 hover:opacity-50" on:click={openGenerateModal}>
					<WandIcon class="w-[20px] h-[20px] fill-white" />
				</button>
				<button class="py-3 px-4 hover:opacity-50" on:click={close}>
					<CloseIcon class="w-[20px] h-[20px] fill-white" />
				</button>
			</div>
		</div>
		<div class="p-4 flex-1 overflow-hidden">
			<div class="h-full relative">
				<div class="flex w-full border border-solid border-black">
					<div class="border-r border-solid border-black p-2 w-1/2">Payment Date</div>
					<div class="border-r border-solid border-black text-right p-2 w-2/5">Payment Value</div>
					<div class="p-2" />
				</div>
				<div
					id="payment-list"
					class="flex flex-col h-[250px] overflow-scroll"
					bind:this={paymentListRef}
				>
					{#each paymentsToAdd as payment}
						<div class="flex h-50">
							<div class="w-1/2 p-2 border-x border-b border-solid border-black">
								<DatePicker bind:value={payment.date} inputClass="w-full" />
							</div>
							<div class="w-2/5 p-2 border-r border-b border-solid border-black">
								<input
									class="text-right w-full outline-none"
									type="number"
									bind:value={payment.amount}
								/>
							</div>
							<div
								class="flex flex-1 items-center justify-center border-r border-b border-solid border-black"
							>
								<button
									class="p-2 hover:opacity-50 cursor-pointer"
									on:click={() => removePayment(payment.id)}
								>
									<CloseIcon class="w-4 h-4 fill-red-700" />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="flex justify-end p-4">
			{#if paymentsToAdd.length > 1}
				<button class="text-blue-400 px-4 hover:underline" on:click={onClickClear}>Clear</button>
			{/if}
		</div>
		<div class="p-4 flex justify-end">
			<button class="mr-8 hover:text-gray-500 px-6 py-2" on:click={close}>Cancel</button>
			<button
				class="bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white px-6 py-2 rounded-sm"
				disabled={!canSaveRepayments}
				on:click={savePayments}>Save</button
			>
		</div>
	</div>

	{#if shouldShowGenerateModal}
		<ExtraPaymentGenerator
			on:close={closeGenerateModal}
			on:generatedPayments={setGeneratedPayments}
		/>
	{/if}
</div>

<script lang="ts">
	import { slide } from 'svelte/transition';
	import RepaymentData from '$lib/sections/Home/RepaymentData.svelte';
	import {
		mortgageAmount,
		interestRate,
		mortgageTerm,
		monthlyRepayment,
		firstPaymentDate,
		extraMonthlyPayment,
		totalLoanCost,
		totalInterestPaid,
		timeToPaidOff,
		calculate,
		reset,
		hasCalculatedMonthlyPayments
	} from '$lib/store';
	import { formatAsEuro } from '$lib/utils';

	$: reset($mortgageAmount, $interestRate, $mortgageTerm, $firstPaymentDate, $extraMonthlyPayment);
</script>

<div class="flex justify-center py-2">
	<h1 class="text-2xl font-bold">Mortgage Calculator</h1>
</div>
<div class="mt-4">
	<div class="flex">
		<div class="flex flex-col">
			<div class="flex items-center mb-3">
				<label class="min-w-[210px] font-bold" for="mortgageAmount">Mortgage Amount:</label>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[200px]"
					type="number"
					min="0"
					bind:value={$mortgageAmount}
					name="mortgageAmount"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="min-w-[210px] font-bold" for="interestRate">Interest Rate (%):</label>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[200px]"
					type="number"
					min="0"
					step="0.05"
					bind:value={$interestRate}
					name="interestRate"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="min-w-[210px] font-bold" for="mortgageTerm">Mortgage Term:</label>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[200px]"
					type="number"
					min="0"
					bind:value={$mortgageTerm}
					name="mortgageTerm"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="min-w-[210px] font-bold" for="firstPaymentDate">Extra Monthly Payment:</label>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[200px]"
					type="number"
					min="0"
					step="50"
					bind:value={$extraMonthlyPayment}
					name="extraMonthlyPayment"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="min-w-[210px] font-bold" for="firstPaymentDate">First Payment Date:</label>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[200px]"
					type="date"
					bind:value={$firstPaymentDate}
					name="firstPaymentDate"
				/>
			</div>

			<button
				class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
				on:click={calculate}>Calculate</button
			>
		</div>
		<div class="ml-8">
			{#if $monthlyRepayment > 0}
				<div class="mt-4" in:slide={{ axis: 'y', duration: 500 }}>
					<span class="underline font-bold text-xl">Base Monthly Repayment: </span>
					{formatAsEuro($monthlyRepayment)}
				</div>
				<div class="mt-4" in:slide={{ axis: 'y', duration: 500 }}>
					<span class="underline font-bold text-xl">Monthly Repayment You'll make: </span>
					{formatAsEuro($monthlyRepayment + $extraMonthlyPayment)}
				</div>
				<div class="mt-4" in:slide={{ axis: 'y', duration: 500 }}>
					<span class="underline font-bold text-xl">Total Loan Cost: </span>
					{$totalLoanCost}
				</div>
				<div class="mt-4" in:slide={{ axis: 'y', duration: 500 }}>
					<span class="underline font-bold text-xl">Total Interest Paid: </span>
					{$totalInterestPaid}
				</div>
				<div class="mt-4" in:slide={{ axis: 'y', duration: 500 }}>
					<span class="underline font-bold text-xl">Years to Pay Off: </span>
					{$timeToPaidOff}
				</div>
			{/if}
		</div>
	</div>
	{#if $hasCalculatedMonthlyPayments}
		<RepaymentData />
	{/if}
</div>

<script lang="ts">
	import { browser } from '$app/environment';
	import CalculationResults from '$lib/sections/Home/CalculationResults.svelte';
	import RepaymentData from '$lib/sections/Home/RepaymentData.svelte';
	import ExtraPaymentModal from './ExtraPaymentModal.svelte';
	import {
		_mortgageBalance,
		_primaryInterestRate,
		_secondaryInterestRate,
		_mortgageTerm,
		_primaryMonthlyRepayment,
		_secondaryMonthlyRepayment,
		_firstPaymentDate,
		_extraMonthlyPayment,
		_totalLoanCost,
		_totalInterestPaid,
		_timeToPaidOff,
		_extraOneOffRepayments,
		calculate,
		reset,
		_hasCalculatedMonthlyPayments,
		_mortgageType,
		_fixedMortgageTerm,
		resetFixedMortgageData
	} from '$lib/store';

	$: reset(
		$_mortgageBalance,
		$_primaryInterestRate,
		$_secondaryInterestRate,
		$_mortgageType,
		$_mortgageTerm,
		$_fixedMortgageTerm,
		$_firstPaymentDate,
		$_extraMonthlyPayment,
		$_extraOneOffRepayments
	);

	$: resetFixedMortgageData($_mortgageType);

	let isExtraPaymentModalOpen = false;

	function togglePaymentModal() {
		isExtraPaymentModalOpen = !isExtraPaymentModalOpen;
	}

	$: {
		if (browser) {
			if (isExtraPaymentModalOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = 'auto';
			}
		}
	}
</script>

<div class="flex justify-center py-2">
	<h1 class="text-2xl font-bold">Mortgage Calculator</h1>
</div>
<div class="mt-4">
	<div class="flex flex-col md:flex-row">
		<div class="flex flex-col">
			<div class="flex items-center mb-3">
				<label class="w-[150px] md:min-w-[250px] font-bold" for="mortgageAmount"
					>Mortgage Amount:</label
				>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
					type="number"
					min="0"
					bind:value={$_mortgageBalance}
					name="mortgageAmount"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="w-[150px] md:min-w-[250px] font-bold" for="interestRate"
					>Interest Rate (%):</label
				>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
					type="number"
					min="0"
					step="0.05"
					bind:value={$_primaryInterestRate}
					name="interestRate"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="w-[150px] md:min-w-[250px] font-bold" for="mortgageType">Mortgage Type:</label
				>
				<div class="ml-3 flex flex-col">
					<label>
						<input
							type="radio"
							bind:group={$_mortgageType}
							name="mortgageType"
							value={'variable'}
						/>
						Variable
					</label>

					<label>
						<input type="radio" bind:group={$_mortgageType} name="mortgageType" value={'fixed'} />
						Fixed
					</label>
				</div>
			</div>
			{#if $_mortgageType === 'fixed'}
				<div class="flex items-center mb-3">
					<label class="w-[150px] md:min-w-[250px] font-bold" for="fixedMortgageTerm"
						>Fixed Rate Term:</label
					>
					<input
						class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
						type="number"
						min="0"
						step="1"
						bind:value={$_fixedMortgageTerm}
						name="fixedMortgageTerm"
					/>
				</div>
				<div class="flex items-center mb-3">
					<label class="w-[150px] md:min-w-[250px] font-bold" for="interestRate"
						>Variable Interest Rate (%):</label
					>
					<input
						class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
						type="number"
						min="0"
						step="0.05"
						bind:value={$_secondaryInterestRate}
						name="interestRate"
					/>
				</div>
			{/if}
			<div class="flex items-center mb-3">
				<label class="w-[150px] md:min-w-[250px] font-bold" for="mortgageTerm">Mortgage Term:</label
				>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
					type="number"
					min="0"
					bind:value={$_mortgageTerm}
					name="mortgageTerm"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="w-[150px] md:min-w-[250px] font-bold" for="firstPaymentDate"
					>Extra Monthly Payment:</label
				>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
					type="number"
					min="0"
					step="50"
					bind:value={$_extraMonthlyPayment}
					name="extraMonthlyPayment"
				/>
			</div>
			<div class="flex items-center mb-3">
				<label class="w-[150px] md:min-w-[250px] font-bold" for="firstPaymentDate"
					>First Payment Date:</label
				>
				<input
					class="ml-3 py-1 px-2 rounded outline-none border border-solid border-gray-500 w-[150px]"
					type="date"
					bind:value={$_firstPaymentDate}
					name="firstPaymentDate"
				/>
			</div>

			<button
				class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mb-2"
				on:click={togglePaymentModal}
				>Extra One off Payments ({Object.keys($_extraOneOffRepayments).length})</button
			>

			<button
				class="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded"
				on:click={calculate}>Calculate</button
			>
		</div>
		{#if $_hasCalculatedMonthlyPayments}
			<CalculationResults />
		{/if}
	</div>
	{#if $_hasCalculatedMonthlyPayments}
		<RepaymentData />
	{/if}
</div>
{#if isExtraPaymentModalOpen}
	<ExtraPaymentModal on:close={togglePaymentModal} />
{/if}

<script>
	import { slide } from 'svelte/transition';
	import {
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
		_hasCalculatedMonthlyPayments,
		_mortgageType,
		_fixedMortgageTerm,
		_datePaidOff
	} from '$lib/store';
	import { formatAsEuro } from '$lib/utils';
</script>

<div class="md:ml-8 w-full">
	<div class="text-center border-b border-solid border-black p-2">
		<span class="font-bold text-lg">MP = Monthly Payment</span>
	</div>
	<table class="w-full" in:slide={{ axis: 'y', duration: 500 }}>
		<tr>
			<td><span class="font-bold text-lg">Base MP = </span></td>
			<td>{formatAsEuro($_primaryMonthlyRepayment)}</td>
		</tr>
		{#if $_extraMonthlyPayment > 0}
			<tr>
				<td><span class="font-bold text-lg">MP + Extra = </span></td>
				<td>{formatAsEuro($_primaryMonthlyRepayment + $_extraMonthlyPayment)}</td>
			</tr>
		{/if}
		{#if $_secondaryInterestRate > 0}
			<tr>
				<td><span class="font-bold text-lg">MP after Fixed = </span></td>
				<td>{formatAsEuro($_secondaryMonthlyRepayment)}</td>
			</tr>
			{#if $_extraMonthlyPayment > 0}
				<tr>
					<td><span class="font-bold text-lg">MP after Fixed + Extra = </span></td>
					<td>{formatAsEuro($_secondaryMonthlyRepayment + $_extraMonthlyPayment)}</td>
				</tr>
			{/if}
		{/if}
		<tr>
			<td><span class="font-bold text-lg">Total Loan Cost = </span></td>
			<td>{$_totalLoanCost}</td>
		</tr>
		<tr>
			<td><span class="font-bold text-lg">Total Interest Paid = </span></td>
			<td>{$_totalInterestPaid}</td>
		</tr>
		<tr>
			<td><span class="font-bold text-lg">Years to Pay Off = </span></td>
			<td>{$_timeToPaidOff}</td>
		</tr>
		<tr>
			<td><span class="font-bold text-lg">Date Paid Off = </span></td>
			<td>{$_datePaidOff}</td>
		</tr>
	</table>
</div>

<style>
	td {
		@apply py-2;
	}

	tr {
		@apply border-b border-solid border-black;
	}

	tr:nth-child(odd) {
		@apply bg-gray-200;
	}

	td:nth-child(1) {
		@apply text-right;
	}

	td:nth-child(2) {
		@apply pl-4;
	}
</style>

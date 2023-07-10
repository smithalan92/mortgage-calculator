<script lang="ts">
	import { slide } from 'svelte/transition';
	import { monthlyPayments } from '$lib/store';
	import PaymentChart from '$lib/sections/Home/PaymentChart.svelte';
</script>

<div in:slide={{ axis: 'y', duration: 1000 }}>
	<div
		class="w-full mt-6 max-h-[300px] overflow-scroll border-t-2 border-b-2 border-solid border-gray-400 relative"
	>
		<table
			class="w-full border-l-2 border-r-2 border-solid border-gray-400 border-collapse relative"
		>
			<thead>
				<tr>
					<th class="border-2 border-solid border-gray-400 p-1 bg-gray-400 top-[-1px] sticky"
						>Payment Date</th
					>
					<th class="border-2 border-solid border-gray-400 p-1 bg-gray-400 top-[-1px] sticky"
						>Principal Paid</th
					>
					<th class="border-2 border-solid border-gray-400 p-1 bg-gray-400 top-[-1px] sticky"
						>Interest Paid</th
					>
					<th class="border-2 border-solid border-gray-400 p-1 bg-gray-400 top-[-1px] sticky"
						>Mortgage Balance</th
					>
				</tr>
			</thead>
			<tbody>
				{#each $monthlyPayments as payment (payment.paymentDate)}
					<tr>
						<td class="border-2 border-solid border-gray-400 p-1">{payment.paymentDate}</td>
						<td class="border-2 border-solid border-gray-400 p-1">{payment.principalDisplay}</td>
						<td class="border-2 border-solid border-gray-400 p-1">{payment.interestDisplay}</td>
						<td class="border-2 border-solid border-gray-400 p-1">{payment.newBalanceDisplay}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<PaymentChart />
</div>

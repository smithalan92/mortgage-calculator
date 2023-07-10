import { format, addMonths, differenceInYears, differenceInMonths } from 'date-fns';
import { writable, get, derived } from 'svelte/store';
import {
	formatAsEuro,
	getChartConfig,
	getMonthlyRepayment,
	getPaymentDetails,
	type PaymentDetail
} from './utils';

export const mortgageAmount = writable(260_000);
export const interestRate = writable(3.95);
export const interestRateDecial = derived(interestRate, (value) => value / 100);
export const mortgageTerm = writable(30);
export const monthlyRepayment = writable(0);
export const firstPaymentDate = writable(format(new Date(), 'yyyy-MM-dd'));
export const extraMonthlyPayment = writable(0);
export const monthlyPayments = writable<PaymentDetail[]>([]);
export const totalLoanCost = derived([monthlyPayments], ([$monthlyPayments]) => {
	return formatAsEuro(
		$monthlyPayments.reduce((acc, current) => acc + current.interest + current.principal, 0)
	);
});
export const hasCalculatedMonthlyPayments = derived(monthlyPayments, ($monthlyPayments) => {
	return $monthlyPayments.length > 0;
});
export const totalInterestPaid = derived(monthlyPayments, ($monthlyPayments) => {
	return formatAsEuro(
		$monthlyPayments.reduce((acc, current) => {
			return acc + current.interest;
		}, 0)
	);
});
export const timeToPaidOff = derived(monthlyPayments, ($monthlyPayments) => {
	if (!$monthlyPayments.length) return 0;
	const firstPaymentDate = $monthlyPayments[0].paymentDate;
	const lastPaymentDate = $monthlyPayments[$monthlyPayments.length - 1].paymentDate;

	const years = differenceInYears(new Date(lastPaymentDate), new Date(firstPaymentDate));
	const months = differenceInMonths(new Date(lastPaymentDate), new Date(firstPaymentDate)) % 12;

	return `${years} years, ${months} months`;
});

export const chartConfig = derived(monthlyPayments, ($monthlyPayments) => {
	return getChartConfig($monthlyPayments);
});

export function calculate() {
	let balance = get(mortgageAmount);
	let paymentDate = new Date(get(firstPaymentDate));
	const interestRateDec = get(interestRateDecial);
	const extraPayment = get(extraMonthlyPayment);

	const monthlyPayment = getMonthlyRepayment(balance, interestRateDec, get(mortgageTerm));

	const currencyFormatter = new Intl.NumberFormat('en-IE', {
		style: 'currency',
		currency: 'EUR'
	});

	const payments: PaymentDetail[] = [];

	while (balance > 0) {
		const data = getPaymentDetails({
			monthlyPayment,
			interestRateDecimal: interestRateDec,
			balance,
			currencyFormatter,
			paymentDate,
			extraPayment
		});
		balance = data.newBalance;
		payments.push(data);
		paymentDate = addMonths(paymentDate, 1);
	}

	monthlyRepayment.set(monthlyPayment);
	monthlyPayments.set(payments);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function reset(...args: any) {
	monthlyRepayment.set(0);
	monthlyPayments.set([]);
}

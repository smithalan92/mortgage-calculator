import { format, addMonths, differenceInYears, differenceInMonths } from 'date-fns';
import { writable, get, derived } from 'svelte/store';
import {
	formatAsEuro,
	getChartConfig,
	getMonthlyRepayment,
	getPaymentDetails,
	type PaymentDetail
} from './utils';

export type MortgageType = 'fixed' | 'variable';

export interface ExtraOneOffRepaymentData {
	[key: string]: ExtraOneOffRepayment;
}

export interface ExtraOneOffRepayment {
	id: string;
	date: string;
	amount: number;
}

export const _mortgageBalance = writable(256_000);
// ie the inital interest rate
export const _primaryInterestRate = writable(3.95);
export const _primaryInterestRateDecimal = derived(_primaryInterestRate, (value) => value / 100);
// If fixed, this is the interest rate when the fixed period ends
export const _secondaryInterestRate = writable(0.0);
export const _secondaryInterestRateDecimal = derived(
	_secondaryInterestRate,
	(value) => value / 100
);
export const _mortgageTerm = writable(30);
export const _fixedMortgageTerm = writable(0);
// starting monthly repayment
export const _primaryMonthlyRepayment = writable(0);
// if fixed mortgage, the repayment when fixed term ends
export const _secondaryMonthlyRepayment = writable(0);
export const _firstPaymentDate = writable(format(new Date(), 'yyyy-MM-dd'));
export const _extraMonthlyPayment = writable(0);
export const _monthlyPayments = writable<PaymentDetail[]>([]);
export const _mortgageType = writable<MortgageType>('variable');
export const _extraOneOffRepayments = writable<ExtraOneOffRepaymentData>({});

export const _totalLoanCost = derived([_monthlyPayments], ([monthlyPayments]) => {
	return formatAsEuro(
		monthlyPayments.reduce((acc, current) => acc + current.interest + current.principal, 0)
	);
});
export const _hasCalculatedMonthlyPayments = derived(_monthlyPayments, (monthlyPayments) => {
	return monthlyPayments.length > 0;
});
export const _totalInterestPaid = derived(_monthlyPayments, (monthlyPayments) => {
	return formatAsEuro(
		monthlyPayments.reduce((acc, current) => {
			return acc + current.interest;
		}, 0)
	);
});
export const _timeToPaidOff = derived(_monthlyPayments, (monthlyPayments) => {
	if (!monthlyPayments.length) return 0;
	const firstPaymentDate = monthlyPayments[0].paymentDate;
	const lastPaymentDate = monthlyPayments[monthlyPayments.length - 1].paymentDate;

	const years = differenceInYears(new Date(lastPaymentDate), new Date(firstPaymentDate));
	const months = differenceInMonths(new Date(lastPaymentDate), new Date(firstPaymentDate)) % 12;

	return `${years} years, ${months} months`;
});

export const _datePaidOff = derived(_monthlyPayments, (monthlyPayments) => {
	if (!monthlyPayments.length) return '_';
	const lastPaymentDate = monthlyPayments[monthlyPayments.length - 1].paymentDate;

	return format(new Date(lastPaymentDate), 'MMMM yyyy');
});

export const _chartConfig = derived(_monthlyPayments, (monthlyPayments) => {
	return getChartConfig(monthlyPayments);
});

export function calculate() {
	let balance = get(_mortgageBalance);
	let paymentDate = new Date(get(_firstPaymentDate));
	const extraPayment = get(_extraMonthlyPayment);
	const mortgageTerm = get(_mortgageTerm);
	const fixedMortgageTerm = get(_fixedMortgageTerm);
	const primaryInterestRate = get(_primaryInterestRateDecimal);
	const secondaryInterestRate = get(_secondaryInterestRateDecimal);
	const extraOneOffPayments = get(_extraOneOffRepayments);

	let primaryMonthlyRepayment = 0;
	let secondaryMonthlyRepayment = 0;

	if (fixedMortgageTerm > 0) {
		primaryMonthlyRepayment = getMonthlyRepayment(balance, primaryInterestRate, mortgageTerm);
	} else {
		primaryMonthlyRepayment = getMonthlyRepayment(balance, primaryInterestRate, mortgageTerm);
	}

	const currencyFormatter = new Intl.NumberFormat('en-IE', {
		style: 'currency',
		currency: 'EUR'
	});

	const payments: PaymentDetail[] = [];

	if (fixedMortgageTerm > 0) {
		let monthlyPayments = fixedMortgageTerm * 12;

		while (monthlyPayments > 0) {
			const data = getPaymentDetails({
				monthlyPayment: primaryMonthlyRepayment,
				interestRateDecimal: primaryInterestRate,
				balance,
				currencyFormatter,
				paymentDate,
				extraPayment
			});
			balance = data.newBalance;
			payments.push(data);
			paymentDate = addMonths(paymentDate, 1);
			monthlyPayments -= 1;
		}

		secondaryMonthlyRepayment = getMonthlyRepayment(
			balance,
			secondaryInterestRate,
			mortgageTerm - fixedMortgageTerm
		);
	}

	while (balance > 0) {
		const data = getPaymentDetails({
			monthlyPayment: fixedMortgageTerm > 0 ? secondaryMonthlyRepayment : primaryMonthlyRepayment,
			interestRateDecimal: fixedMortgageTerm > 0 ? secondaryInterestRate : primaryInterestRate,
			balance,
			currencyFormatter,
			paymentDate,
			extraPayment,
			extraOneOffPayments
		});
		balance = data.newBalance;
		payments.push(data);
		paymentDate = addMonths(paymentDate, 1);
	}

	_primaryMonthlyRepayment.set(primaryMonthlyRepayment);
	_secondaryMonthlyRepayment.set(secondaryMonthlyRepayment);
	_monthlyPayments.set(payments);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function reset(...args: unknown[]) {
	_primaryMonthlyRepayment.set(0);
	_secondaryMonthlyRepayment.set(0);
	_monthlyPayments.set([]);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resetFixedMortgageData(...args: unknown[]) {
	_secondaryInterestRate.set(0);
	_fixedMortgageTerm.set(0);
}

import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { derived, get, writable } from 'svelte/store';
import {
	calculateFixedRateMortgage,
	calculateVariableRateMortgage,
	type PaymentDetail
} from './mortgageCalculations';
import { formatAsEuro } from './utils';

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

export function calculate() {
	const balance = get(_mortgageBalance);
	const paymentDate = new Date(get(_firstPaymentDate));
	const extraPayment = get(_extraMonthlyPayment);
	const mortgageTerm = get(_mortgageTerm);
	const fixedMortgageTerm = get(_fixedMortgageTerm);
	const primaryInterestRate = get(_primaryInterestRateDecimal);
	const secondaryInterestRate = get(_secondaryInterestRateDecimal);
	const extraOneOffPayments = get(_extraOneOffRepayments);

	if (fixedMortgageTerm === 0) {
		const { monthlyPayment, payments } = calculateVariableRateMortgage({
			mortgageBalance: balance,
			variableInterestRate: primaryInterestRate,
			mortgageTerm,
			firstPaymentDate: paymentDate,
			extraMonthlyPayment: extraPayment,
			extraOneOffPayments: extraOneOffPayments
		});

		_primaryMonthlyRepayment.set(monthlyPayment);
		_monthlyPayments.set(payments);
	} else {
		const { fixedRateMonthlyPayment, variableRateMonthlyPayment, payments } =
			calculateFixedRateMortgage({
				mortgageBalance: balance,
				fixedInterestRate: primaryInterestRate,
				variableInterestRate: secondaryInterestRate,
				mortgageTerm,
				fixedRateTerm: fixedMortgageTerm,
				firstPaymentDate: paymentDate,
				extraMonthlyPayment: extraPayment,
				extraOneOffPayments: extraOneOffPayments
			});

		_primaryMonthlyRepayment.set(fixedRateMonthlyPayment);
		_secondaryMonthlyRepayment.set(variableRateMonthlyPayment);
		_monthlyPayments.set(payments);
	}
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

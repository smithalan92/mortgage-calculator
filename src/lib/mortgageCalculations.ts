import type { ExtraOneOffRepaymentData } from '$lib/store';
import { formatAsEuro, roundNumber } from '$lib/utils';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';

/*************************
 *************************
 * TYPES GO HERE *********
 * ***********************
 */

export interface PaymentDetail {
	interest: number;
	interestDisplay: string;
	principal: number;
	principalDisplay: string;
	newBalance: number;
	newBalanceDisplay: string;
	paymentDate: string;
}

/*************************
 *************************
 * LOGIC HERE ************
 * ***********************
 */

export function getMonthlyPayment({
	principal,
	interestRate,
	mortgageTerm,
	paymentsPerYear = 12
}: {
	principal: number;
	interestRate: number;
	mortgageTerm: number;
	paymentsPerYear?: number;
}) {
	const monthlyInterestPayment = interestRate / 12;
	return (
		principal *
		((monthlyInterestPayment * (1 + monthlyInterestPayment) ** (paymentsPerYear * mortgageTerm)) /
			((1 + monthlyInterestPayment) ** (paymentsPerYear * mortgageTerm) - 1))
	);
}

export function getLoanAmortisation(
	monthlyPayment: number,
	outstandingBalance: number,
	interestRateDecimal: number
) {
	const principalPayment = monthlyPayment - outstandingBalance * (interestRateDecimal / 12);

	return {
		principal: principalPayment,
		interest: monthlyPayment - principalPayment
	};
}

export function getPaymentDetails({
	monthlyPayment,
	interestRate,
	balance,
	paymentDate,
	extraMonthlyPayment,
	extraOneOffPayments
}: {
	monthlyPayment: number;
	interestRate: number;
	balance: number;
	paymentDate: Date;
	extraMonthlyPayment: number;
	extraOneOffPayments: ExtraOneOffRepaymentData;
}): PaymentDetail {
	let interest, principal, truePrincipal;

	if (balance < monthlyPayment + extraMonthlyPayment) {
		interest = balance * (interestRate / 12);
		principal = balance;
		truePrincipal = principal;
	} else {
		({ interest, principal } = getLoanAmortisation(monthlyPayment, balance, interestRate));
		truePrincipal = principal + extraMonthlyPayment;

		const paymentDateFormatted = format(paymentDate, 'yyyy-MM');

		if (extraOneOffPayments[paymentDateFormatted]) {
			truePrincipal += extraOneOffPayments[paymentDateFormatted].amount;
		}
	}

	// Make sure to include the extra payment towards the principal

	const data: PaymentDetail = {
		interest: roundNumber(interest),
		interestDisplay: formatAsEuro(interest),
		principal: roundNumber(truePrincipal),
		principalDisplay: formatAsEuro(truePrincipal),
		newBalance: roundNumber(balance - truePrincipal),
		newBalanceDisplay: formatAsEuro(balance - truePrincipal),
		paymentDate: format(paymentDate, 'dd MMM yyyy')
	};

	return data;
}

export function calculateVariableRateMortgage({
	mortgageBalance,
	variableInterestRate,
	mortgageTerm,
	firstPaymentDate,
	extraMonthlyPayment,
	extraOneOffPayments
}: {
	mortgageBalance: number;
	variableInterestRate: number;
	mortgageTerm: number;
	firstPaymentDate: Date;
	extraMonthlyPayment: number;
	extraOneOffPayments: ExtraOneOffRepaymentData;
}) {
	let paymentDate = firstPaymentDate;
	let remainingMortgageBalance = mortgageBalance;
	const monthlyPayment = getMonthlyPayment({
		principal: mortgageBalance,
		interestRate: variableInterestRate,
		mortgageTerm
	});

	const payments: PaymentDetail[] = [];

	while (remainingMortgageBalance > 0) {
		const data = getPaymentDetails({
			monthlyPayment,
			interestRate: variableInterestRate,
			balance: remainingMortgageBalance,
			paymentDate,
			extraMonthlyPayment,
			extraOneOffPayments
		});

		remainingMortgageBalance = data.newBalance;
		payments.push(data);
		paymentDate = addMonths(paymentDate, 1);
	}

	return {
		monthlyPayment,
		payments
	};
}

export function calculateFixedRateMortgage({
	mortgageBalance,
	variableInterestRate,
	fixedInterestRate,
	mortgageTerm,
	fixedRateTerm,
	firstPaymentDate,
	extraMonthlyPayment,
	extraOneOffPayments
}: {
	mortgageBalance: number;
	variableInterestRate: number;
	fixedInterestRate: number;
	mortgageTerm: number;
	fixedRateTerm: number;
	firstPaymentDate: Date;
	extraMonthlyPayment: number;
	extraOneOffPayments: ExtraOneOffRepaymentData;
}) {
	let paymentDate = firstPaymentDate;
	let remainingMortgageBalance = mortgageBalance;
	const variableRateMortgageTerm = mortgageTerm - fixedRateTerm;
	const fixedRateMonthlyPayment = getMonthlyPayment({
		principal: mortgageBalance,
		interestRate: fixedInterestRate,
		mortgageTerm
	});

	let payments: PaymentDetail[] = [];

	let numberOfFixedRateMonthlyRepayments = fixedRateTerm * 12;

	while (numberOfFixedRateMonthlyRepayments > 0) {
		const data = getPaymentDetails({
			monthlyPayment: fixedRateMonthlyPayment,
			interestRate: fixedInterestRate,
			balance: remainingMortgageBalance,
			paymentDate,
			extraMonthlyPayment,
			extraOneOffPayments
		});

		remainingMortgageBalance = data.newBalance;
		payments.push(data);
		paymentDate = addMonths(paymentDate, 1);
		numberOfFixedRateMonthlyRepayments -= 1;
	}

	const { payments: variableRatePayments, monthlyPayment: variableRateMonthlyPayment } =
		calculateVariableRateMortgage({
			mortgageBalance: remainingMortgageBalance,
			variableInterestRate,
			mortgageTerm: variableRateMortgageTerm,
			firstPaymentDate: paymentDate,
			extraMonthlyPayment,
			extraOneOffPayments
		});

	payments = [...payments, ...variableRatePayments];

	return {
		payments,
		fixedRateMonthlyPayment,
		variableRateMonthlyPayment
	};
}

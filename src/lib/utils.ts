import type { ChartConfiguration, ChartData } from 'chart.js';
import { format } from 'date-fns';
import type { ExtraOneOffRepaymentData } from './store';

const currencyFormatter = new Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR'
});

export function roundNumber(number: number, places = 2) {
	// @ts-expect-error string and number mixing
	return +(Math.round(number + 'e+' + places) + 'e-' + places);
}

export function formatAsEuro(number: number) {
	return currencyFormatter.format(number);
}

export function getMonthlyRepayment(
	principal: number,
	interestRateDecimal: number,
	termYears: number,
	payementsPerYear = 12
) {
	const monthlyInterestPayment = interestRateDecimal / 12;
	return (
		principal *
		((monthlyInterestPayment * (1 + monthlyInterestPayment) ** (payementsPerYear * termYears)) /
			((1 + monthlyInterestPayment) ** (payementsPerYear * termYears) - 1))
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

export interface PaymentDetail {
	interest: number;
	interestDisplay: string;
	principal: number;
	principalDisplay: string;
	newBalance: number;
	newBalanceDisplay: string;
	paymentDate: string;
}

export function getPaymentDetails({
	monthlyPayment,
	interestRateDecimal,
	balance,
	currencyFormatter,
	paymentDate,
	extraPayment,
	extraOneOffPayments
}: {
	monthlyPayment: number;
	interestRateDecimal: number;
	balance: number;
	currencyFormatter: Intl.NumberFormat;
	paymentDate: Date;
	extraPayment: number;
	extraOneOffPayments: ExtraOneOffRepaymentData;
}): PaymentDetail {
	let interest, principal, truePrincipal;

	if (balance < monthlyPayment + extraPayment) {
		interest = balance * (interestRateDecimal / 12);
		principal = balance;
		truePrincipal = principal;
	} else {
		({ interest, principal } = getLoanAmortisation(monthlyPayment, balance, interestRateDecimal));
		truePrincipal = principal + extraPayment;

		const paymentDateFormatted = format(paymentDate, 'yyyy-MM');

		if (extraOneOffPayments[paymentDateFormatted]) {
			truePrincipal += extraOneOffPayments[paymentDateFormatted].amount;
		}
	}

	// Make sure to include the extra payment towards the principal

	const data: PaymentDetail = {
		interest: roundNumber(interest),
		interestDisplay: currencyFormatter.format(interest),
		principal: roundNumber(truePrincipal),
		principalDisplay: currencyFormatter.format(truePrincipal),
		newBalance: roundNumber(balance - truePrincipal),
		newBalanceDisplay: currencyFormatter.format(balance - truePrincipal),
		paymentDate: format(paymentDate, 'dd MMM yyyy')
	};

	return data;
}

export interface PaymentChartDataItem {
	id: string;
	value: number;
}

export interface PaymentChartData {
	principal: PaymentChartDataItem[];
	interest: PaymentChartDataItem[];
}

export function getChartData(payments: PaymentDetail[]): PaymentChartData {
	const [principalData, interestData] = payments.reduce<Array<PaymentChartDataItem[]>>(
		(acc, current) => {
			acc[0].push({ id: current.paymentDate, value: current.principal });
			acc[1].push({ id: current.paymentDate, value: current.interest });
			return acc;
		},
		[[], []]
	);

	return {
		principal: principalData,
		interest: interestData
	};
}

export function getChartConfig(payments: PaymentDetail[]): ChartConfiguration {
	const chartDatasets = getChartData(payments);
	const data: ChartData<'line', PaymentChartDataItem[]> = {
		datasets: [
			{
				label: 'Principal paid',
				data: chartDatasets.principal
			},
			{
				label: 'Interest paid',
				data: chartDatasets.interest
			}
		]
	};

	const config: ChartConfiguration = {
		type: 'line',
		// @ts-expect-error custom data type used in data.datasets.data, see options.parsing
		data,
		options: {
			maintainAspectRatio: false,
			parsing: {
				xAxisKey: 'id',
				yAxisKey: 'value'
			},
			scales: {
				x: {
					ticks: {
						display: false
					},
					grid: {
						display: false
					}
				},
				y: {
					grid: {
						display: false
					}
				}
			},
			plugins: {
				title: {
					display: true,
					text: 'Principal vs Interest paid per monthly payment',
					padding: 12,
					font: {
						size: 20,
						weight: 'bold'
					}
				}
			}
		}
	};

	return config;
}

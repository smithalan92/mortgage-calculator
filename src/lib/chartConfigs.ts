import type { ChartConfiguration, ChartData } from 'chart.js';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import type { PaymentDetail } from './mortgageCalculations';

export interface PaymentChartDataItem {
	id: string;
	value: number;
}

export interface PaymentChartData {
	principal: PaymentChartDataItem[];
	interest: PaymentChartDataItem[];
}

export function getPaymentChartConfig(payments: PaymentDetail[]): ChartConfiguration {
	const [principalData, interestData] = payments.reduce<Array<PaymentChartDataItem[]>>(
		(acc, current) => {
			acc[0].push({ id: current.paymentDate, value: current.principal });
			acc[1].push({ id: current.paymentDate, value: current.interest });
			return acc;
		},
		[[], []]
	);

	const data: ChartData<'line', PaymentChartDataItem[]> = {
		datasets: [
			{
				label: 'Principal paid',
				data: principalData
			},
			{
				label: 'Interest paid',
				data: interestData
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

export function getBalanceChartConfig(
	mortgageAmount: number,
	payments: PaymentDetail[]
): ChartConfiguration {
	const balances = payments.map((p) => ({
		id: p.paymentDate,
		value: p.newBalance
	}));

	balances.splice(0, 0, {
		id: format(subMonths(new Date(balances[0].id), 1), 'dd MMM yyyy'),
		value: mortgageAmount
	});

	const data: ChartData<'line', PaymentChartDataItem[]> = {
		datasets: [
			{
				label: 'Balance Remaining',
				data: balances
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
					text: 'Balance over time',
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

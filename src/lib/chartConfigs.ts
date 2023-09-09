import type { ChartConfiguration, ChartData } from 'chart.js';
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

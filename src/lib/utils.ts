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

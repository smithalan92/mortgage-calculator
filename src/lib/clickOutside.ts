export default function clickOutside(element: HTMLElement, callbackFunction: () => void) {
	function onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;

		// Document.body check is needed here to ensure the element we clicked on is still on the dom
		// If its not it may be conditionally rendered so we cant rely on a element.contains check
		if (document.body.contains(target) && !element.contains(event.target as HTMLElement)) {
			callbackFunction();
		}
	}

	document.body.addEventListener('click', onClick);

	return {
		update(newCallbackFunction: () => void) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener('click', onClick);
		}
	};
}

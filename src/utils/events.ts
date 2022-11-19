const delta = 6;
let startX = 0;
let startY = 0;

// Ignores drag
export function onRealClick(element: HTMLElement, callback: (event: MouseEvent) => void) {
	element.addEventListener("mousedown", (event) => {
		startX = event.clientX;
		startY = event.clientY;
	});

	element.addEventListener("mouseup", (event) => {
		const dx = Math.abs(event.clientX - startX);
		const dy = Math.abs(event.clientY - startY);
		if (dx < delta && dy < delta) callback(event);
	});
}

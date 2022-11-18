export function defineComponent(tag: string, c: CustomElementConstructor): void {
	if (customElements.get(tag) === undefined) customElements.define(tag, c);
}

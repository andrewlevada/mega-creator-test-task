import { html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { pageStyles, plasmicPublicApiToken } from "~src/global";
import scopedStyles from "./styles.scss";
import { defineComponent } from "~utils/components";
import { PlasmicComponent } from "lit-plasmic";
import "lit-plasmic";

export default (): void => defineComponent("app-page--editor", EditorPage);
export class EditorPage extends LitElement {
	render(): TemplateResult {
		return html`
			<plasmic-component name="EditorPage" projectId="8dw8cFpzDBK4cZFUBJNuWw" 
							   publicApiToken=${plasmicPublicApiToken}
							   @loaded=${this.onPlasmicLoaded} ${ref(this.plasmicRef)}></plasmic-component>
		`;
	}

	private plasmicRef = createRef<PlasmicComponent>();

	private onPlasmicLoaded() {
		console.log("loaded");
		const root = this.plasmicRef.value!.shadowRoot!;
		const canvas = root.querySelector(`div[class*=EditorPage__canvas]`) as HTMLElement;
		canvas.addEventListener("click", () => console.log("click!"));
	}

	protected createRenderRoot(): Element | ShadowRoot {
		return this;
	}


	static styles = [...pageStyles, unsafeCSS(scopedStyles)];
}

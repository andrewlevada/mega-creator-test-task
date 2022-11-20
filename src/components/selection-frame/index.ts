import { defineComponent } from "~utils/components";
import { html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { componentStyles } from "~src/global";
import scopedStyles from "./styles.scss";

const xAxis = ["left", "right"];
const yAxis = ["top", "bottom"];

export interface RotationArrowDragEvent extends CustomEvent {
	  detail: {
		  side: "top" | "bottom" | "left" | "right" | "all";
		  event: DragEvent;
	  }
}

export default (): void => defineComponent("selection-frame", SelectionFrame);
export class SelectionFrame extends LitElement {
    render(): TemplateResult {
        return html`
            <div class="border"></div>
            
            ${xAxis.map((x) => yAxis.map((y) => html`
	            <div class="el square ${x} ${y}"></div>
            `))}
            
            ${[...xAxis, ...yAxis].map((side) => html`
            	<img class="el rotate ${side}" src="rotate-symbol.png" alt="null"
	                 @drag=${(event: DragEvent) => this.emitDragEvent(side, event)}/>
            `)}
        `;
    }

	private fixUrl(url: string): string {
		// removing first directory
		return url.replace(/\/[^/]+/, "");
	}

	private emitDragEvent(side: string, event: DragEvent): void {
		this.dispatchEvent(new CustomEvent("rotation-drag", {
			detail: {
				side,
				event
			}
		}) as RotationArrowDragEvent);
	}

    static styles = [...componentStyles, unsafeCSS(scopedStyles)];
}

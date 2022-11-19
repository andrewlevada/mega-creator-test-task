import { defineComponent } from "~utils/components";
import { html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { componentStyles } from "~src/global";
import rotateSymbol from "~graphics/rotate-symbol.png";
import scopedStyles from "./styles.scss";

const xAxis = ["left", "right"];
const yAxis = ["top", "bottom"];

export default (): void => defineComponent("selection-frame", SelectionFrame);
export class SelectionFrame extends LitElement {
    render(): TemplateResult {
        return html`
            <div class="border"></div>
            
            ${xAxis.map((x) => yAxis.map((y) => html`
	            <div class="el square ${x} ${y}"></div>
            `))}
            
            ${[...xAxis, ...yAxis].map((side) => html`
            	<img class="el rotate ${side}" src=${rotateSymbol} alt="null"/>
            `)}
        `;
    }

    static styles = [...componentStyles, unsafeCSS(scopedStyles)];
}

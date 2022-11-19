import { defineComponent } from "~utils/components";
import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { componentStyles, plasmicPublicApiToken } from "~src/global";
import * as Three from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getObjectOnClick, getScreenCoordsAndSize } from "~utils/three";
import { onRealClick } from "~utils/events";
import { createRef, ref } from "lit/directives/ref.js";
import { PlasmicComponent } from "lit-plasmic";
import { RotationArrowDragEvent } from "~components/selection-frame";

import("~components/selection-frame").then(f => f.default());

export default (): void => defineComponent("space-scene", SpaceScene);
export class SpaceScene extends LitElement {
	private scene!: Three.Scene;
	private camera!: Three.Camera;
	private renderer!: Three.WebGLRenderer;
	private controls!: DragControls;
	private orbitControls!: OrbitControls;

	private object!: Three.Mesh;
	private selectionOutline!: Three.LineSegments;
	private hideControls: boolean = false;

	private objectSelected: boolean = false;
	@state() objectRotating: boolean = false;

	@state() renderElement: HTMLElement | null = null;

	render(): TemplateResult {
		return html`
			${this.renderElement}
			
			<selection-frame ${ref(this.selectionFrame)} id="selection-frame"
			                 @rotation-drag=${(event: RotationArrowDragEvent) => this.onRotationArrowDrag(event)}></selection-frame>
			
			<plasmic-component name="ActionMenu" projectId="8dw8cFpzDBK4cZFUBJNuWw"
							   publicApiToken=${plasmicPublicApiToken} id="action-menu"
							   componentProps=${this.objectRotating ? JSON.stringify({ type: "context" }) : ""}
							   @loaded=${this.bindActionMenu} ${ref(this.actionMenu)}></plasmic-component>
		`;
	}

	protected updated(_changedProperties: PropertyValues) {
		super.updated(_changedProperties);
		if (this.actionMenu.value) this.actionMenu.value.refetchComponent();
	}

	private selectionFrame = createRef<HTMLElement>();
	private actionMenu = createRef<PlasmicComponent>();

	constructor() {
		super();
		this.initScene();
	}

	private initScene() {
		// Scene
		this.scene = new Three.Scene();
		this.scene.background = new Three.Color(0xffffff);

		// Camera
		const frustumSize = 100;
		const aspect = 944 / 736;
		this.camera = new Three.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
		this.camera.position.set(50, 40, 0);
		this.camera.lookAt(0, 0, 0);

		// Renderer
		this.renderer = new Three.WebGLRenderer({ antialias: true });
		this.renderer.setSize(944, 736);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = Three.PCFSoftShadowMap;
		this.renderer.outputEncoding = Three.sRGBEncoding;
		this.renderer.physicallyCorrectLights = true;
		this.renderer.toneMapping = Three.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		this.renderer.setClearColor(0xffffff, 1.0);
		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.top = "90px";
		this.renderer.domElement.style.left = "472px";
		this.renderer.domElement.style.width = "944px";
		this.renderer.domElement.style.height = "736px";
		this.renderElement = this.renderer.domElement;

		// Lights
		const ambientLight = new Three.AmbientLight(0xffffff, 1);
		this.scene.add(ambientLight);

		// Object
		this.object = new Three.Mesh(
			new Three.BoxGeometry(10, 10, 10),
			new Three.MeshNormalMaterial()
		);
		this.object.position.set(0, 0, 0);
		this.object.rotation.set(30, 90, 0);
		this.scene.add(this.object);

		// Drag Controls
		this.controls = new DragControls([this.object], this.camera, this.renderer.domElement);
		this.controls.addEventListener("drag", () => this.renderCanvas());

		// Orbit Controls
		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls.addEventListener("change", () => this.renderCanvas());
		this.orbitControls.enabled = false;

		// Object select
		onRealClick(this.renderer.domElement, event => this.onObjectClick(event));

		this.renderCanvas();
	}

	private onObjectClick(event: MouseEvent): void {
		const object = getObjectOnClick(this.renderer, this.scene, this.camera, event);
		this.objectSelected = !!object;
		if (!object) {
			this.objectRotating = false;
			this.orbitControls.enabled = false;
			this.controls.activate();
		}
		this.renderCanvas();
	}


	private rotationArrowLastX: number = 0;
	private rotationArrowLastY: number = 0;
	private onRotationArrowDrag(event: RotationArrowDragEvent): void {
		if (event.type === "start" || this.rotationArrowLastX == 0 || this.rotationArrowLastY == 0) {
			this.rotationArrowLastX = event.detail.event.clientX;
			this.rotationArrowLastY = event.detail.event.clientY;
			this.hideControls = true;
			return;
		}

		if (event.detail.event.clientX === 0 && event.detail.event.clientY === 0) {
			this.rotationArrowLastX = 0;
			this.rotationArrowLastY = 0;
			this.hideControls = false;
			this.renderCanvas();
			return;
		}

		const deltaX = event.detail.event.clientX - this.rotationArrowLastX;
		const deltaY = event.detail.event.clientY - this.rotationArrowLastY;

		if (event.detail.side === "left" || event.detail.side === "right")
			this.object.rotateOnWorldAxis(new Three.Vector3(0, 1, 0), deltaX / 100);
		else this.object.rotateOnWorldAxis(new Three.Vector3(0, 0, 1), -deltaY / 100);

		this.rotationArrowLastX = event.detail.event.clientX;
		this.rotationArrowLastY = event.detail.event.clientY;

		this.renderCanvas();
	}

	private renderCanvas(): void {
		if (this.selectionOutline) {
			this.scene.remove(this.selectionOutline);
			this.selectionFrame.value!.style.display = "none";
			this.actionMenu.value!.style.display = "none";
		}

		const coords = getScreenCoordsAndSize(this.renderer, this.scene, this.camera, this.object);

		if (this.objectSelected) {
			// Outline
			const edges = new Three.EdgesGeometry(this.object.geometry);
			this.selectionOutline = new Three.LineSegments(edges, new Three.LineBasicMaterial({ color: 0x00A9F0 }));
			this.selectionOutline.position.copy(this.object.position);
			this.selectionOutline.rotation.copy(this.object.rotation);
			this.scene.add(this.selectionOutline);

			if (!this.hideControls) {
				// Action menu
				this.actionMenu.value!.style.left = `${coords.x + 472 + coords.width + 16}px`;
				this.actionMenu.value!.style.top = `${coords.y + 90}px`;
				this.actionMenu.value!.style.display = "block";

				if (!this.objectRotating) {
					// Selection frame
					this.selectionFrame.value!.style.left = `${coords.x + 472}px`;
					this.selectionFrame.value!.style.top = `${coords.y + 90}px`;
					this.selectionFrame.value!.style.width = `${coords.width}px`;
					this.selectionFrame.value!.style.height = `${coords.height}px`;
					this.selectionFrame.value!.style.display = "block";
				}
			}
		}

		this.renderer.render(this.scene, this.camera);
	}

	private bindActionMenu() {
		const adjustmentsButton = this.actionMenu.value!.shadowRoot!.querySelector("div[class*=adjustments]") as HTMLElement;
		const rotationButton = this.actionMenu.value!.shadowRoot!.querySelector("div[class*=rotation]") as HTMLElement;

		adjustmentsButton?.addEventListener("click", () => console.log("Adjustments clicked"));
		rotationButton?.addEventListener("click", () => {
			this.objectRotating = true;
			this.orbitControls.enabled = true;
			this.controls.deactivate();
			this.renderCanvas();
		});

		// Context variation

		const doneButton = this.actionMenu.value!.shadowRoot!.querySelector("div[class*=done]") as HTMLElement;
		const resetButton = this.actionMenu.value!.shadowRoot!.querySelector("div[class*=reset]") as HTMLElement;

		doneButton.addEventListener("click", () => {
			this.objectRotating = false;
			this.orbitControls.enabled = false;
			this.controls.activate();
			this.renderCanvas();
		});

		resetButton.addEventListener("click", () => {
			this.objectRotating = false;
			this.orbitControls.enabled = false;
			this.controls.activate();
			this.renderCanvas();
		});
	}

	static styles = [...componentStyles, css`
		#selection-frame {
			position: absolute;
			pointer-events: none;
		}
		
		#action-menu {
			position: absolute;
		}
	`];
}

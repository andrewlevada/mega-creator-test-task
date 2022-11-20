import { defineComponent } from "~utils/components";
import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { componentStyles, plasmicPublicApiToken } from "~src/global";
import * as Three from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
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

	private object!: Three.Group;
	private primaryMesh!: Three.Mesh;
	private selectionOutline!: Three.LineSegments;
	private hideControls: boolean = false;

	private objectSelected: boolean = false;
	@state() objectRotating: boolean = false;

	@state() renderElement: HTMLElement | null = null;

	render(): TemplateResult {
		return html`
			${this.renderElement}
			
			<selection-frame ${ref(this.selectionFrame)} id="selection-frame" draggable="true"
			                 @rotation-drag=${(event: RotationArrowDragEvent) => this.onRotationArrowDrag(event)}></selection-frame>
			
			<plasmic-component name="ActionMenu" projectId="8dw8cFpzDBK4cZFUBJNuWw"
							   publicApiToken=${plasmicPublicApiToken} id="action-menu"
							   componentProps=${this.objectRotating ? JSON.stringify({ type: "context" }) : ""}
							   @loaded=${this.bindActionMenu} ${ref(this.actionMenu)}></plasmic-component>
		`;
	}

	private selectionFrame = createRef<HTMLElement>();
	private actionMenu = createRef<PlasmicComponent>();

	protected firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);
		this.initScene();
	}

	protected updated(_changedProperties: PropertyValues) {
		super.updated(_changedProperties);
		if (this.actionMenu.value) this.actionMenu.value.refetchComponent();
	}

	private initScene() {
		// Scene
		this.scene = new Three.Scene();
		this.scene.background = new Three.Color(0xffffff);

		// Camera
		const frustumSize = 100;
		const aspect = 944 / 736;
		this.camera = new Three.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
		this.camera.position.set(50, 0, 0);
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
		const loader = new OBJLoader();
		loader.load("sample.obj", (object: Three.Group) => {
			this.object = object;
			this.object.position.set(0, 0, 0);
			this.object.rotation.set(0, 0, 0);

			this.primaryMesh = object.children[0] as Three.Mesh;
			this.primaryMesh.position.set(0, 0, 0);
			this.primaryMesh.rotation.set(-90, 0, 30);
			this.primaryMesh.scale.set(3, 3, 3);
			this.primaryMesh.material = new Three.MeshNormalMaterial();

			this.scene.add(this.object);

			console.log("Placed object!");

			// Drag Controls
			this.controls = new DragControls([this.object], this.camera, this.renderer.domElement);
			this.controls.addEventListener("drag", () => this.renderCanvas());

			this.renderCanvas();
		});

		// Object select
		onRealClick(this.renderer.domElement, event => this.onObjectClick(event));

		// Object drag in rotation mode
		this.selectionFrame.value!.addEventListener("drag", (event) => {
			event.preventDefault();
			event.dataTransfer!.setDragImage(new Image(), 0, 0);
			if (!this.objectRotating) return;
			this.onRotationArrowDrag(new CustomEvent("rotation-drag", {
				detail: {
					side: "all",
					event
				}
			}) as RotationArrowDragEvent);
		});

		this.renderCanvas();
	}

	private onObjectClick(event: MouseEvent): void {
		const object = getObjectOnClick(this.renderer, this.scene, this.camera, event);
		this.objectSelected = !!object;
		if (!object) {
			this.objectRotating = false;
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

		console.log(deltaX, deltaY);

		if (event.detail.side === "left" || event.detail.side === "right" || event.detail.side === "all")
			this.primaryMesh.rotateOnWorldAxis(new Three.Vector3(0, 1, 0), deltaX / 100);

		if (event.detail.side === "top" || event.detail.side === "bottom" || event.detail.side === "all")
			this.primaryMesh.rotateOnWorldAxis(new Three.Vector3(0, 0, 1), -deltaY / 100);

		this.rotationArrowLastX = event.detail.event.clientX;
		this.rotationArrowLastY = event.detail.event.clientY;

		this.renderCanvas();
	}

	private lastRenderTime = 0;
	private renderCanvas(): void {
		if (!this.object) return;
		// if (this.lastRenderTime + 1000 / 30 > Date.now()) return;
		this.lastRenderTime = Date.now();

		// Reset state
		if (this.selectionOutline) this.scene.remove(this.selectionOutline);
		this.selectionFrame.value!.style.opacity = "0";
		this.selectionFrame.value!.style.pointerEvents = "none";
		this.actionMenu.value!.style.display = "none";

		const coords = getScreenCoordsAndSize(this.renderer, this.scene, this.camera, this.object.children[0] as Three.Mesh);

		if (this.objectSelected) {
			// Outline
			// const edges = new Three.EdgesGeometry(this.primaryMesh.geometry);
			// this.selectionOutline = new Three.LineSegments(edges, new Three.LineBasicMaterial({ color: 0x00A9F0 }));
			// this.selectionOutline.position.copy(this.primaryMesh.position);
			// this.selectionOutline.rotation.copy(this.primaryMesh.rotation);
			// this.scene.add(this.selectionOutline);

			if (!this.hideControls) {
				// Action menu
				this.actionMenu.value!.style.left = `${coords.x + 472 + coords.width + 16}px`;
				this.actionMenu.value!.style.top = `${coords.y + 90}px`;
				this.actionMenu.value!.style.display = "block";

				// Selection frame
				this.selectionFrame.value!.style.left = `${coords.x + 472}px`;
				this.selectionFrame.value!.style.top = `${coords.y + 90}px`;
				this.selectionFrame.value!.style.width = `${coords.width}px`;
				this.selectionFrame.value!.style.height = `${coords.height}px`;

				if (this.objectRotating) this.selectionFrame.value!.style.pointerEvents = "auto";
				else this.selectionFrame.value!.style.opacity = "1";
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
			this.controls.deactivate();
			this.renderCanvas();
		});

		// Context variation

		const doneButton = this.actionMenu.value!.shadowRoot!.querySelector("div[class*=done]") as HTMLElement;
		const resetButton = this.actionMenu.value!.shadowRoot!.querySelector("div[class*=reset]") as HTMLElement;

		doneButton.addEventListener("click", () => {
			this.objectRotating = false;
			this.controls.activate();
			this.renderCanvas();
		});

		resetButton.addEventListener("click", () => {
			this.objectRotating = false;
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

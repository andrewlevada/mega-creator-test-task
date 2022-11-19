import { defineComponent } from "~utils/components";
import { css, html, LitElement, TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import * as Three from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { getObjectOnClick, getScreenCoordsAndSize } from "~utils/three";
import { onRealClick } from "~utils/events";
import { createRef, ref } from "lit/directives/ref.js";

export default (): void => defineComponent("space-scene", SpaceScene);
export class SpaceScene extends LitElement {
	private scene!: Three.Scene;
	private camera!: Three.Camera;
	private renderer!: Three.WebGLRenderer;
	private controls!: DragControls;

	private object!: Three.Mesh;
	private selectionOutline!: Three.LineSegments;

	private objectSelected: boolean = false;

	@state() renderElement: HTMLElement | null = null;

	render(): TemplateResult {
		return html`
			${this.renderElement}
			<div ${ref(this.selectionFrame)} id="selection-frame"></div>
		`;
	}

	private selectionFrame = createRef<HTMLElement>();

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

		// Object select
		onRealClick(this.renderer.domElement, event => this.onObjectClick(event));

		this.renderCanvas();
	}

	private onObjectClick(event: MouseEvent): void {
		const object = getObjectOnClick(this.renderer, this.scene, this.camera, event);
		this.objectSelected = !!object;
		this.renderCanvas();
	}

	private renderCanvas(): void {
		if (this.selectionOutline) {
			this.scene.remove(this.selectionOutline);
			this.selectionFrame.value!.style.display = "none";
		}

		if (this.objectSelected) {
			const edges = new Three.EdgesGeometry(this.object.geometry);
			this.selectionOutline = new Three.LineSegments(edges, new Three.LineBasicMaterial({ color: 0x00A9F0 }));
			this.selectionOutline.position.copy(this.object.position);
			this.selectionOutline.rotation.copy(this.object.rotation);
			this.scene.add(this.selectionOutline);

			const coords = getScreenCoordsAndSize(this.renderer, this.scene, this.camera, this.object);
			this.selectionFrame.value!.style.left = `${coords.x + 472}px`;
			this.selectionFrame.value!.style.top = `${coords.y + 90}px`;
			this.selectionFrame.value!.style.width = `${coords.width}px`;
			this.selectionFrame.value!.style.height = `${coords.height}px`;
			this.selectionFrame.value!.style.display = "block";
		}

		this.renderer.render(this.scene, this.camera);
	}

	static styles = [...componentStyles, css`
		#selection-frame {
			position: absolute;
			pointer-events: none;
			width: 100px;
			height: 100px;
			border: 1px dashed #00A9F0;
		}
	`];
}

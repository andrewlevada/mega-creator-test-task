import * as Three from "three";

export function getObjectOnClick(renderer: Three.WebGLRenderer, scene: Three.Scene, camera: Three.Camera, event: MouseEvent): Three.Object3D | null {
	// Raycasting to determine if the object was clicked
	const raycaster = new Three.Raycaster();
	const mouse = new Three.Vector2();

	mouse.x = ((event.clientX - 472) / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y = -((event.clientY - 90) / renderer.domElement.clientHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(scene.children);
	if (intersects.length == 0) return null;
	return  intersects[0].object;
}

export function getScreenCoordsAndSize(renderer: Three.WebGLRenderer, scene: Three.Scene, camera: Three.Camera, object: Three.Mesh): {x: number, y: number, width: number, height: number} {
	const vector = new Three.Vector3();
	vector.setFromMatrixPosition(object.matrixWorld);
	vector.project(camera);

	vector.x = (vector.x + 1) / 2 * renderer.domElement.clientWidth;
	vector.y = -(vector.y - 1) / 2 * renderer.domElement.clientHeight;

	const width = 120;
	const height = 120;

	return { x: vector.x - width / 2, y: vector.y - height / 2, width, height };
}

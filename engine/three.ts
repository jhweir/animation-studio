// 3D with three.js. Import from engine/three.ts only in scenes that use 3D, so films without it
// never load three.js.
//
//   const { scene, camera } = layer3d(ctx, { camera: isometric(6) });
//   const cube = loadModel('/assets/3d/we-cube.glb');   // an empty group, filled when loaded
//   scene.add(cube);
//   onFrame(t => { cube.rotation.y = 0.4 * (t - ctx.t0); });   // the layer renders after every onFrame
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { named } from './dom.ts';
import { capturing } from './env.ts';
import { afterFrame, waitFor } from './frame.ts';
import type { SceneContext } from './film.ts';

export { THREE };

export interface Layer3D {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
}

/**
 * An orthographic camera looking down the (1, 1, 1) diagonal: the isometric view of the WE cube on
 * the about page. `size` is how many world units fit the stage's height.
 */
export function isometric(size: number, aspect = 16 / 9): THREE.OrthographicCamera {
  const cam = new THREE.OrthographicCamera((-size * aspect) / 2, (size * aspect) / 2, size / 2, -size / 2, 0.1, 100);
  cam.position.set(10, 10, 10);
  cam.lookAt(0, 0, 0);
  return cam;
}

/** A perspective camera at `position`, looking at the origin. */
export function perspective(fov: number, position: [number, number, number], aspect = 16 / 9): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.1, 200);
  cam.position.set(...position);
  cam.lookAt(0, 0, 0);
  return cam;
}

/**
 * A WebGL canvas covering the stage in this scene's 3D layer, rendered after every frame's updates
 * while the scene is on. Transparent, so the background and SVG art show through.
 */
export function layer3d(ctx: SceneContext, opts: { camera?: THREE.Camera; name?: string } = {}): Layer3D {
  const { width, height } = ctx.stage;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  // When capturing, draw at exactly the output's pixel density (1 for 1080p, 2 for 4K): headless
  // Chrome shrinks canvases by picking pixels, which breaks thin lines apart. In the player, at
  // least 2x, so it stays sharp on 4K screens.
  renderer.setPixelRatio(capturing ? window.devicePixelRatio : Math.max(2, window.devicePixelRatio));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0' });
  named(opts.name ?? '3d', canvas); // the player can't see inside the canvas, so the whole layer gets one name
  ctx.three.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = opts.camera ?? isometric(6, width / height);
  afterFrame(() => {
    if (ctx.three.style.display !== 'none') renderer.render(scene, camera);
  });
  return { scene, camera, renderer, canvas };
}

const loader = new GLTFLoader();

/**
 * Load a glTF/GLB model. Returns an empty group right away and fills it once loaded, centred on the
 * origin; the frame that first needs it waits for the load. `onLoad` restyles the model (materials,
 * edges) before it's first drawn.
 */
export function loadModel(url: string, onLoad?: (model: THREE.Group) => void): THREE.Group {
  const group = new THREE.Group();
  waitFor(
    loader.loadAsync(url).then(gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      onLoad?.(model);
      group.add(model);
    }),
  );
  return group;
}

/** Every mesh inside an object (a loaded model is a tree of groups and meshes). */
export function meshes(root: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = [];
  root.traverse(o => {
    if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh);
  });
  return out;
}

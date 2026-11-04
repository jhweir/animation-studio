// Coasys looks for 3D models. Import this file directly (it isn't re-exported from index.ts), so
// films without 3D never load three.js.
import { meshes, THREE } from '../../engine/three.ts';
import { color } from './tokens.ts';

export interface GlassOptions {
  /** Face colour. Default mint (ours). */
  fill?: string;
  /** Face opacity, 0..1. Default 0.18. */
  opacity?: number;
  /** Edge colour. Default mint. */
  edge?: string;
  /** Edge opacity, 0..1. Default 1. */
  edgeOpacity?: number;
}

export interface Glass {
  faces: THREE.MeshLambertMaterial;
  edges: THREE.LineBasicMaterial;
}

/**
 * The WE cube's look on the about page, in Coasys tokens: translucent faces with crisp edge lines
 * (only the real edges, not the triangulation). Adds soft light to `scene`. Returns the two
 * materials, so a scene can animate their colour and opacity.
 */
export function glass(model: THREE.Object3D, scene: THREE.Scene, o: GlassOptions = {}): Glass {
  if (!scene.userData.coasysLight) {
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 10, 6);
    scene.add(key);
    scene.userData.coasysLight = true;
  }
  const faces = new THREE.MeshLambertMaterial({
    color: o.fill ?? color.mint,
    transparent: true,
    opacity: o.opacity ?? 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true, // pushes faces back so the edges draw on top without flicker
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const edges = new THREE.LineBasicMaterial({ color: o.edge ?? color.mint, transparent: true, opacity: o.edgeOpacity ?? 1 });
  for (const mesh of meshes(model)) {
    mesh.material = faces;
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 1), edges);
    lines.position.copy(mesh.position);
    lines.rotation.copy(mesh.rotation);
    lines.scale.copy(mesh.scale);
    mesh.parent?.add(lines);
  }
  return { faces, edges };
}

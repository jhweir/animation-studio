// Line 5: the WE cube pops in at the centre, turning slowly under the isometric camera; mint glass
// faces and edges; a caption below.
import { clamp, defineScene, eback, onFrame, prog } from '../../../../../engine/index.ts';
import { isometric, layer3d, loadModel } from '../../../../../engine/three.ts';
import { caption } from '../../../../../styles/coasys/index.ts';
import { glass } from '../../../../../styles/coasys/three.ts';

export default defineScene('cube', ctx => {
  const l5 = ctx.line(0);
  const { scene } = layer3d(ctx, { camera: isometric(10), name: 'we-cube' });
  const cube = loadModel('/assets/3d/we-cube.glb', model => glass(model, scene));
  scene.add(cube);

  caption(ctx.text, {
    name: 'caption',
    label: 'Three dimensions',
    t0: l5.v0,
    t1: ctx.t1,
    top: 860,
    rows: [[{ h: 'Drawn live, <em>in 3D</em>.', t: l5.v0 + 0.3 }]],
  });

  onFrame(t => {
    const u = prog(t, ctx.t0 + 0.1, ctx.t0 + 0.6);
    cube.scale.setScalar(Math.max(0.0001, u >= 1 ? 1 : eback(clamp(u))));
    cube.rotation.y = 0.5 * (t - ctx.t0); // a slow turn, about one revolution every 12.5 s
  });
});

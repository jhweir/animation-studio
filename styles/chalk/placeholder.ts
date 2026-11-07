// Chalk placeholder (same behaviour as Coasys's). The stand-in for a scene a cut hasn't built yet: the section's title, and its narration appearing
// sentence by sentence as it's spoken. Lets a film play end to end, with its real timing, while
// sections are built one at a time.
import { div, eout, hvis, named, onFrame, prog, win, type SceneContext } from '../../engine/index.ts';

export function placeholder(ctx: SceneContext): void {
  const box = named('placeholder', div('placeholder', ctx.text));
  div('ph-tag', box, 'Not animated yet');
  div('ph-title', box, ctx.title ?? ctx.id);
  ctx.lineTimes.forEach((l, i) => {
    const para = div('ph-line', box);
    const sentences = (l.parts?.length ? splitText(l.text, l.parts.length) : [l.text]).map((s, j) => {
      const span = document.createElement('span');
      span.textContent = `${s} `;
      para.appendChild(span);
      return { span, at: ctx.part(i, j).v0 };
    });
    const next = ctx.lineTimes[i + 1];
    const end = next ? next.v0 - 0.1 : ctx.t1;
    onFrame(t => {
      const o = win(t, l.v0 - 0.15, end, 0.2, 0.25);
      hvis(para, o);
      if (o <= 0) return;
      for (const s of sentences) s.span.style.opacity = (0.25 + 0.75 * eout(prog(t, s.at - 0.1, s.at + 0.3))).toFixed(3);
    });
  });
  onFrame(t => hvis(box, win(t, ctx.t0, ctx.t1, 0.3, 0.3)));
}

/** The line's text cut back into its n sentences (the timeline keeps the joined text). */
function splitText(text: string, n: number): string[] {
  const parts = text.split(/(?<=[.!?][”"’)]?)\s+(?=[A-Z“"‘(])/);
  if (parts.length === n) return parts;
  return [text];
}

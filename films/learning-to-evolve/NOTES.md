# Learning to evolve (learning-to-evolve)

The philosophical companion to `broken-app-paradigm`. Social technology already evolves, but only
by whole products living and dying; life's history is evolution learning to evolve better, moving
trial and error inward. Then forests versus bodies: what integration takes, and where it must stop.
Cut: `learning-to-evolve/main` (focused script, style `coasys`, draft voice `am_michael`, score
`coasys-ambient`).

## State

- 2026-11-10: first draft script (`scripts/2026-11-10-full.md`, 941 words, about 6:00). Not yet
  reviewed by James. No look, cut or scenes.
- 2026-11-10: focused version (`scripts/2026-11-10-focused.md`, 618 words, about 4:00) written
  alongside, at James's request: drops forest/body, integration limits and the "next transition".
  Three rungs (recombination, sharing sideways, learning) set up in §3 and paid off by WE in §5.
  Both versions kept for comparison.
- 2026-11-11: first storyboard. Cut `main` built from the focused script with every scene as key
  poses and rough motion (29 `board()` frames); `pnpm film board learning-to-evolve` renders it to
  `build/learning-to-evolve/main/board/`. Silent timing (no voice yet). Waiting on James's review of
  the imagery.
- 2026-11-13: imagery approved; voiced with the draft voice (~4:21). All nine scenes animated from the
  storyboard (32 `board()` frames, each on its fully formed pose). Motion is anchored to lines/parts:
  pop-ins, draw-ons, flights and slides replace the crossfades; sound cues on arrivals. Motion helpers
  live in `cuts/main/kit.ts` (popIn, arrive, drawn, drawArrow, fly, quad, pulse, hold); `head()` now
  returns `{ g, outline }` so the outline draws on. Nothing added to the style. Not yet reviewed in
  the player.

## Decisions

- Full version: philosophical, not a pitch; WE is not named in the narration. The focused
  version names WE in §5. The end card points to the
  broken-app-paradigm film, whose evolve version (`2026-11-10-evolve.md`) shares the
  variation/selection/inheritance spine.
- Scientists and sources stay off screen; the ideas are drawn from Campbell, Dennett, Kirschner and
  Gerhart, Maynard Smith and Szathmáry, Michod and Godfrey-Smith (check framings before naming any).
- Integration has a stated limit (§8): people are not cells; the goal is a balance each group sets,
  with freedom to belong to many groups and to leave.

## Known rough edges (for review)

- 0:05–0:11: lineage generations pop in on an even spread across the first two sentences, not on
  particular words.
- 0:38: in the crossfade from the bracketed unit to the two fates, the two apps start popping while
  the unit is still fading.
- 1:49 (109s): each shrinking loop flies out of the previous one, so they overlap mid-flight for ~0.8s.
- 3:22–3:23 (202.5s): the handoff loop crossfades mint→white while growing; both dots show briefly.
  Scene 6 reads scene 5's last line time (`scene('climbing')`) to keep the mint loop's dot continuous.
- 3:38 (218.3s): the reach arrow toward private messages grazes the bottom of the "what it does" panel
  (as in the board); the dashed arrow from the board is now solid so it can draw on.
- 4:08–4:09 (248–249s): the tip communities pop just after the mint branches reach them and gather
  into the title loop ~1s later; tight, check the pace.
- Some times inside long lines are fractions of the line (e.g. the safety beat in §6, cartridge drops
  in §5 at ~0.9s per name) rather than word times; re-check if the voice is re-recorded.

## Open questions

- End card wording depends on the companion film's final title.

## Storyboard imagery (first pass)

- The shared pieces (loop, app box, community, cartridge, WE core, company, at/pose/caps/marks) moved
  into `styles/coasys/sketch.ts` on 2026-11-13, when broken-app-paradigm needed them too. The
  biology (cell, bacterium, plasmid, ladder, head) stays in `cuts/main/kit.ts`.
- The loop (try, test, keep) is the film's motif: huge and slow for apps, shrinking with each rung.
- Moods: problem for apps (§1, 2, 4), blueprint for life (§3), ours for WE (§5–8).
- Good ideas and traits are orange (value); life's rungs light orange, WE's counterparts light mint.
- Each WE counterpart in §5 mirrors its biology frame in §3 (same layout).

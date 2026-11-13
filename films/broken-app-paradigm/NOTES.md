# The broken app paradigm: notes

The first WE · Coasys video: the broken app paradigm, from the users' side and the builders', and
the open, living alternative. Video 2 (how WE works) follows.

## Scripts

- `scripts/2026-11-03-full.md`: the full version (866 words), as first sent to the bots. Their
  render of it ran 5.5–6 min and felt long.
- `scripts/2026-11-05-short.md`: the short version, the one being built. Section 1 settled on
  2026-11-04. Sections 2–7 are the first short draft and still to be worked through one by one.
- 2026-11-10 alternative framings, written while rethinking the film's angle (none built yet):
  - `scripts/2026-11-10-full.md`: v2 full (1,264 words, about 7:50). Adds stakes, misalignment,
    network effects, past platform openings, why now. Too long; carries two theses.
  - `scripts/2026-11-10-focused.md`: v2 narrowed to the app paradigm (883 words, about 5:30).
  - `scripts/2026-11-10-evolve.md`: written fresh around "social software can't evolve"
    (variation, selection, inheritance), with a mutual-aid group as the thread (899 words, about
    5:35). James's favourite so far. The wider stakes and the evolutionary philosophy moved to a
    companion film, `films/learning-to-evolve`.

These scripts are now the source of the words; the drafts in the planning notes are history.

- `scripts/2026-11-13-general.md`: the general version (877 words, about 5:30; the cut's silent
  estimate is 6:23). No worked example: fractal diversity through the social-cell holarchy, the
  knowledge problem (even a well-meaning team can't), the long tail, the builder's idea inside a
  rebuilt shell (front end first), islands, and the root cause "the unit is the wrong size". Written
  to complement `films/learning-to-evolve`; keeps evolutionary vocabulary out.

## Cuts

- `short`: the short script, `am_michael` draft voice, `coasys-ambient` score. 4:04 voiced.
- `general`: the general script, `am_michael` draft voice (5:46 voiced), `coasys-ambient` score.
  Storyboarded on 2026-11-13 (key poses from `styles/coasys/sketch.ts`, imagery approved by James),
  then animated the same day: every scene now moves with the narration, keeping the boarded imagery.
  37 `board()` frames still mark the fully formed poses (`pnpm film board broken-app-paradigm/general`).
  Motion helpers live in the cut's `kit.ts` (pop, arrive, drawn, drawArrow with dashes, fade,
  stagger, crowd/popPeople (a community with movable people), appParts/popEach (an app whose features
  pop), blobSquarePath (a membrane pressed square), and `camera`/`zoomAt` (keyed views; a zoom is a
  pure zoom about the point both views share)). Nothing was added to the style.

## State

| scene | state |
|---|---|
| short cut: their-ground (1) | second draft (leaderboard race), waiting for James's review |
| short cut: users (2) … end-card | placeholders |
| general cut: all 11 scenes | animated (first pass, 2026-11-13), waiting for James's review |

### General cut: what each scene does

- **shape**: community grows in, talk/organise/decide arrive as said; problem mood: team pops, app
  draws and its features pop, it seals, 24 copies fly out to a crowd; then the community squashed
  square in a box, and the builder with a small idea beside a huge app.
- **diversity**: one continuous camera: field pops in from the middle (drifting), labels as named,
  slight pull-back on "hundreds of thousands"; ring picks the climate group, dive in (detail
  cross-fades with zoom), people cells pop; dive into one person (others step back), five facets pop
  as day/role/conversation are said; pull all the way back on "all of it moves"; then 12 → 1,000
  (flashes red on "breaks") → split; holarchy builds left to right.
- **fixed**: app box pops, layout grid draws, toolkit pops, central team and arrow; three steel squares,
  communities press down into them (membranes morph square, people into rows); bend to fit (frame
  draws, membrane squares, one person pushed out) vs one community breaking into five apps, links
  drawn and crossed out; the five boxes flash on "spread across five apps".
- **impossible**: company + coins, shrinks back on "isn't the whole problem"; five-person team, "still
  can't"; the team walks to the far side; communities and their needs pop, a wall rises on "far away",
  company and app pop; long tail draws on, head shades, tail communities pop; app creeps toward the
  group, which moves off leaving a dashed ghost.
- **builders**: three builders, ideas pop as named; the map idea stays, tries to leave (crossed);
  dashed whole-app outline; nine shell layers draw on as each is named; backend slab rises; whole
  stack squashes into the proportion bar, idea slides to the sliver.
- **islands**: bot drafts purple layers fast; they close into the finished app, which moves right as
  its island spreads; home island and community; dashed crossing arrow; community leans and draws back
  on "bet on something new"; scene shrinks away into seven islands, links drawn, then crossed.
- **wrong-size**: a two-ended line; needs pop (and keep changing shape), ideas pop; the app drops in
  with a thud; one need and one idea are set inside it to show the scale; the big words.
- **other-fields**: three panels pop as named, pieces slide up under each; on the pattern line the
  three merge into one small core and 14 pieces fly out to ring it; the ring glows on "fit together".
- **why-not**: platform; door slides open a crack, apps/bots come up, it shuts, pushes them back,
  padlock; frame glows on "control of the interface"; community, code pops inside, arrows to message
  and person; two requirement cards pop as said, ticks draw on.
- **right-size**: core rises; blocks, engine sweep and rule docks light as named; four pieces drop in
  as named; the first lifts out, the "what it does" panel lists its rows; builder + map piece, four
  communities, copies ride the arcs into them; community assembles three pieces, forum dims and is
  crossed, rota comes in, membrane grows; people pop, pieces pop under them and dock into the core.
- **end-card**: next, promise, core; the piece drops in at the end of the line (`final` cue).

### Known rough edges (general cut)

- 52.9–53.4: after the pull-back the field shows only briefly before fading under the "twelve people"
  community, which pops in while the field is still fading (a short overlap).
- 37.0–38.5 (dive into the community): neighbouring communities grow thick strokes as they pass
  off-screen; reads fine in motion but looks heavy in a still at ~37.6.
- 51.4–52.0 (pull-back): mid-zoom stills show big shoulders of field people at the top edge.
- Word-level times are estimated from each sentence's span (no word timings), so some arrivals may sit
  a beat early or late; adjust the fractions passed to `k(...)`/`word(...)` in the scene.
- 104 s: the five team members overlap slightly (boarded spacing kept).
- Dashed lines drawn with `drawn()` come out solid (drawOn uses the dash array); use `drawArrow` with
  `dash` for a dashed draw-on.

## Decisions

- Pronouns: platforms are always "they"; "we" is held back to the closing line.
- No colours or styles invented per film: the Coasys style's tokens only (James, 2026-10-30).
- Music: shade + piano for the opener, dark + heartbeat for the two problem sections, a lift on
  the root cause, then a cut into warm (arpeggio, then strings) and a resolve on the end card.

## Section 1 visual idea (James, 2026-11-04)

A globe; three company buildings; grey roots spreading across the planet like a nervous system,
contrasted with mint for healthy, living alternatives that appear and fade.

## Section 1, first draft (2026-11-05, replaced)

Globe turning slowly (centre lon 12° drifting east, lat 16°); three steel towers rise on "companies";
320 people dots on land; grey roots creep from the towers' feet over "crept in slowly" and reach
everyone by the end of "no way to push back" (people turn steel as they're reached); pulses run
back along the main roots. Mint sprouts flicker and fade on "keep appearing, and keep fading";
three small mint towers rise and fade on "one company, one sealed app". Towers grow and roots
thicken on "size and attention win" (big words, art dimmed). A red crack on "broken"; the globe
lifts and shrinks, and "the people who use them" / "the people who build them" appear below.

Towers and small towers are drawn in the scene for now; promote them to the style if they recur.

## Section 1, second draft (2026-11-05)

James preferred a leaderboard race of real, named platforms to the abstract towers, in layout B of
the mock-ups (board left, globe right), with option 3 for the data: race 2006–2021, then cut to a
"today" frame by company.

- Data: `data/platforms.csv`, `owners.csv`, `sources.md` (cited, compiled 2026-11-05; nothing
  interpolated there). `data/race.ts` is the curated selection and says what was left out and why.
  On screen: a source line; between reported years bars move in straight lines.
- 0–1.5 s globe and board in; the race runs 2006→2021 from 1.6 s to the end of line 2 (~1.5 s a
  year). Cables run from the top four bars to their owner's ground on the globe; each owner grows a
  root network in proportion to its biggest platform (MySpace's withers); people dots turn steel as
  roots reach them. Owners follow acquisitions (WhatsApp and Instagram move to Meta's ground).
- Line 2: seven mint sprouts appear, grow small roots of their own, and fade.
- Line 3 ("size and attention win"): the board cuts to Today by company (Meta 3.58B daily people,
  Alphabet 2B (2019), Tencent, ByteDance 1B (2021), …, Bluesky and Mastodon in mint); a red dashed
  line drops under the four giants. The big "size and attention" words were dropped.
- Line 4: the crack; the board clears, the globe moves to the centre and shrinks; "the people who
  use them" / "who build them" appear.

The race (`engine/race.ts`) and leaderboard (`styles/coasys/leaderboard.ts`) are reusable for other
films and data.

## Open tweaks

None yet.

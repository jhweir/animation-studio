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

## Cuts

- `short`: the short script, `am_michael` draft voice, `coasys-ambient` score. 4:04 voiced.

## State

| scene | state |
|---|---|
| their-ground (1) | second draft (leaderboard race), waiting for James's review |
| users (2) … end-card | placeholders |

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

// Where the stage is running.

/**
 * True when the renderer is capturing frames (headless Chrome, stage.html?capture=1); false in the
 * player. Use it only for how something is drawn, never for what is drawn: a film must look the
 * same in both.
 */
export const capturing: boolean = new URLSearchParams(location.search).has('capture');

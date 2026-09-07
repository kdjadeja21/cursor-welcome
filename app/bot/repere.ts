/**
 * Resting ball radius in viewBox units. Everything else in the engine is a
 * fraction of this, so measured video values stay independent of display size.
 */
export const BALL_RADIUS = 100;

/**
 * Half-side of the displayed viewBox. Margin beyond the radius houses the
 * orbit rings (up to 1.4× radius).
 */
export const HALF_VIEWBOX = 158;

// Helper functions
// wraps any number into the range -w to 0, in both directions
export const wrap = (value, w) => (((value % w) + w) % w) - w;
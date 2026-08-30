export const WORLD_BOUNDS = {
  x: -2400,
  y: -2400,
  w: 4800,
  h: 4800
};

export const TARGET_FRAME_BUDGET = 1000 / 60; // 16.67ms per frame at 60fps
export const MAX_DELTA_TIME = 0.1; // Max simulation dt clamp in seconds
export const PARTICLE_POOL_CAP = 1000; // Upper limit for active particle pool

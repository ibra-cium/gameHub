import { PurgeObjective } from './PurgeObjective.js';
import { ContainObjective } from './ContainObjective.js';
import { SurviveObjective } from './SurviveObjective.js';
import { PatrolObjective } from './PatrolObjective.js';
import { EscortObjective } from './EscortObjective.js';
import { HuntObjective } from './HuntObjective.js';

export const OBJECTIVES = {
  purge: PurgeObjective,
  contain: ContainObjective,
  survive: SurviveObjective,
  patrol: PatrolObjective,
  escort: EscortObjective,
  hunt: HuntObjective
};


import { ENUM } from "../enum";

export class WorkMode extends ENUM {
  static ENUM = {
    REMOTE: "remote",
    HYBRID: "hybrid",
    ON_SITE: "on_site",
  } as const;
}

export type WorkModeType = (typeof WorkMode.ENUM)[keyof typeof WorkMode.ENUM];

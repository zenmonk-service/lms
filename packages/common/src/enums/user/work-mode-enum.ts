import { ENUM } from "../enum";

export class WorkMode extends ENUM {
  static ENUM = {
    OFFICE: "office",
    REMOTE: "remote",
    HYBRID: "hybrid",
    FIELD: "field",
    ON_SITE: "on_site",
    WORK_FROM_HOME: "work_from_home",
  } as const;
}

export type WorkModeType = (typeof WorkMode.ENUM)[keyof typeof WorkMode.ENUM];

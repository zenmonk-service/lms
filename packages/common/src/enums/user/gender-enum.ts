import { ENUM } from "../enum";

export class Gender extends ENUM {
  static ENUM = {
    MALE: "male",
    FEMALE: "female",
    OTHER: "other",
  } as const;
}

export type GenderType = (typeof Gender.ENUM)[keyof typeof Gender.ENUM];

import { ENUM } from "../enum";

// The frontend's copy of this enum (features/user/user.type.ts) uses
// capitalized display values ("Grandmother", etc.) instead of these
// lowercase codes — this file mirrors the backend, which is what's
// actually persisted/validated.
export class GuardianRelation extends ENUM {
  static ENUM = {
    GRANDMOTHER: "grandmother",
    GRANDFATHER: "grandfather",
    BROTHER: "brother",
    SISTER: "sister",
    UNCLE: "uncle",
    AUNT: "aunt",
    GUARDIAN: "guardian",
    OTHER: "other",
  } as const;
}

export type GuardianRelationType =
  (typeof GuardianRelation.ENUM)[keyof typeof GuardianRelation.ENUM];

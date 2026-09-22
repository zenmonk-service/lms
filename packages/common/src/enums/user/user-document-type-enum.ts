import { ENUM } from "../enum";

export class UserDocumentType extends ENUM {
  static ENUM = {
    AADHAAR_CARD: "aadhaar_card",
    PAN_CARD: "pan_card",
    PASSPORT: "passport",
    DRIVING_LICENSE: "driving_license",
    RESUME: "resume",
    EDUCATION_CERTIFICATE: "education_certificate",
    EXPERIENCE_CERTIFICATE: "experience_certificate",
    OFFER_LETTER: "offer_letter",
    UAN: "uan",
    OTHER: "other",
  } as const;
}

export type UserDocumentTypeType =
  (typeof UserDocumentType.ENUM)[keyof typeof UserDocumentType.ENUM];

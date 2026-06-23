const { ENUM } = require("../../../common/enum");

class UserDocumentType extends ENUM {
  static ENUM = {
    AADHAR_CARD: "aadhar_card",
    PAN_CARD: "pan_card",
    PASSPORT: "passport",
    DRIVING_LICENSE: "driving_license",
    RESUME: "resume",
    EDUCATION_CERTIFICATE: "education_certificate",
    EXPERIENCE_CERTIFICATE: "experience_certificate",
    OFFER_LETTER: "offer_letter",
    OTHER: "other",
  };
}

exports.UserDocumentType = UserDocumentType;
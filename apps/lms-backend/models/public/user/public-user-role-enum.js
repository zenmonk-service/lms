const { ENUM } = require("../../../lib/enum");

class PublicUserRole extends ENUM {
  static ENUM = {
    SUPERADMIN: "superadmin",
    USER: "user",
  };
}
exports.PublicUserRole = PublicUserRole;

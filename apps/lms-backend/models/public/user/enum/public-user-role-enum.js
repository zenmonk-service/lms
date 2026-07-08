const { ENUM } = require("../../../common/enum");

class PublicUserRole extends ENUM {
  static ENUM = {
    SUPERADMIN: "superadmin",
    USER: "user",
    ADMIN: "admin",
  };
}
exports.PublicUserRole = PublicUserRole;

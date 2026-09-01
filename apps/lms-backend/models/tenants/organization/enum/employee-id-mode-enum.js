const { ENUM } = require("../../../common/enum");

class EmployeeIdMode extends ENUM {
  static ENUM = {
    AUTO: "auto",
    MANUAL: "manual",
  };
}

exports.EmployeeIdMode = EmployeeIdMode;

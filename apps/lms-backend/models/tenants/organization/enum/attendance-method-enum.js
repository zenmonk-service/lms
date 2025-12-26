const { ENUM } = require("../../../common/enum");

class AttendanceMethod extends ENUM {
  static ENUM = {
    MANUAL: "manual",
    FACE: "face",
    DUAL: "dual",
  };
}

exports.AttendanceMethod = AttendanceMethod;

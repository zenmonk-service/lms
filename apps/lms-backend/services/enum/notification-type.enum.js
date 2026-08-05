const { ENUM } = require("../../models/common/enum");

class NotificationType extends ENUM {
  static ENUM = {
    LEAVE: "leave",
    GENERAL: "general",
    EVENT: "event",
    INACTIVE_USER: "inactive_user",
    CONFORMATION: "conformation",
  };
}

exports.NotificationType = NotificationType;

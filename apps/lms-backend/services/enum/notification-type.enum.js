const { ENUM } = require("../../models/common/enum");

class NotificationType extends ENUM {
  static ENUM = {
    LEAVE: "leave",
    GENERAL: "general",
    EVENT: "event",
  };
}

exports.NotificationType = NotificationType;

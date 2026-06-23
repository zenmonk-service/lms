const { ENUM } = require("../../../common/enum");

class WorkMode extends ENUM {
  static ENUM = {
    OFFICE: 'office',
    REMOTE: 'remote',
    HYBRID: 'hybrid',
    FIELD: 'field',
    ON_SITE: 'on_site',
    WORK_FROM_HOME: 'work_from_home',
  };
}

exports.WorkMode = WorkMode;
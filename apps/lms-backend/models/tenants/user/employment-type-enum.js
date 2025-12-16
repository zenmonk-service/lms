const { ENUM } = require("../../common/enum");


class EmployementType extends ENUM {
  static ENUM = {
    PART_TIME: 'part_time',
    FULL_TIME: 'full_time',
    CONTRACT: 'contract',
    INTERN: 'internship',
    TEMPORARY: 'temporary',
  };
}

exports.EmployementType = EmployementType;

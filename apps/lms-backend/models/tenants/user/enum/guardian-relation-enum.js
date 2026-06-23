const { ENUM } = require("../../../common/enum");

class GuardianRelation extends ENUM {
  static ENUM = {
    GRANDMOTHER: 'grandmother',
    GRANDFATHER: 'grandfather',
    BROTHER: 'brother',
    SISTER: 'sister',
    UNCLE: 'uncle',
    AUNT: 'aunt',
    GUARDIAN: 'guardian',
    OTHER: 'other',
  };
}

exports.GuardianRelation = GuardianRelation;

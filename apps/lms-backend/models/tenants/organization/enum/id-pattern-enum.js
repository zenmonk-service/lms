const { ENUM } = require("../../../common/enum");

class EmployeeIdMode extends ENUM {
    static ENUM = {
        AUTO: 'auto',
        MANUAL: 'manual',
    };
}

exports.EmployeeIdMode = EmployeeIdMode;

class UserIdPattern extends ENUM {
    static ENUM = {
        ALPHA_NUMERIC: 'alpha_numeric',
        NUMERIC: 'numeric',
    };
}

exports.UserIdPattern = UserIdPattern;

const { ENUM } = require("../../../common/enum");

class UserIdPattern extends ENUM {
    static ENUM = {
        ALPHA_NUMERIC: 'alpha_numeric',
        NUMERIC: 'numeric',
    };
}

exports.UserIdPattern = UserIdPattern;

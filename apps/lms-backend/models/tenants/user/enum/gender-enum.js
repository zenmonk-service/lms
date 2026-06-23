const { ENUM } = require("../../../common/enum");

class Gender extends ENUM {
    static ENUM = {
        MALE: "male",
        FEMALE: "female",
        ALL: 'all',
        OTHER: 'other'
    };
}

exports.Gender = Gender;

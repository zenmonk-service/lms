const { ENUM } = require("../../../common/enum");

class HolidayType extends ENUM {
    static ENUM = {
        PUBLIC: "public",
        COMPANY: "organization",
        OPTIONAL: "optional",
    }
}
exports.HolidayType = HolidayType;
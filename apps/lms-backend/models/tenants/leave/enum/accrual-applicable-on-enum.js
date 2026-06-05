const { ENUM } = require("../../../common/enum");

class AccuralApplicableOn extends ENUM {
    static ENUM = {
        START: "start",
        END: "end",
        DATE_OF_JOINING: "date_of_joining",
    };
}

exports.AccuralApplicableOn = AccuralApplicableOn;
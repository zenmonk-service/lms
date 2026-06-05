const { ENUM } = require("../../../common/enum");

class WorkDay extends ENUM {
    static ENUM = {
        MONDAY: 'monday',
        TUESDAY: 'tuesday',
        WEDNESDAY: 'wednesday',
        THURSDAY: 'thursday',
        FRIDAY: 'friday',
        SATURDAY: 'saturday',
        SUNDAY: 'sunday',
    };    
}

exports.WorkDay = WorkDay;
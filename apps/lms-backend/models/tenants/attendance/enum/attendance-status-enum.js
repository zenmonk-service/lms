const { ENUM } = require("../../../common/enum");

class AttendanceStatus extends ENUM {
    static ENUM = {
        PRESENT: 'present',
        ABSENT: 'absent',
        ON_LEAVE: 'on_leave',
        HOLIDAY: 'holiday',
        EARLY_DEPARTURE: 'early_departure',
        MISSED_PUNCH: 'missed_punch',
        LATE :"late",
        ON_DUTY :"on_duty"
    };
}

exports.AttendanceStatus = AttendanceStatus;
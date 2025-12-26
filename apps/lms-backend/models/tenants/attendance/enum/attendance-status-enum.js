const { ENUM } = require("../../../common/enum");

class AttendanceStatus extends ENUM {
    static ENUM = {
        PRESENT: 'present',
        ABSENT: 'absent',
        ON_LEAVE: 'on_leave',
        HOLIDAY: 'holiday',
        EARLY_DEPARTURE: 'early_departure',
        ON_DUTY: 'on_duty',
        WORK_FROM_HOME: 'work_from_home',
        HALF_DAY: 'half_day',
        MISSED_PUNCH: 'missed_punch',
        WEEK_OFF: 'week_off'
    };
}

exports.AttendanceStatus = AttendanceStatus;
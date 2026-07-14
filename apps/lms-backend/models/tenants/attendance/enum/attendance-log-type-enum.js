const { ENUM } = require("../../../common/enum");

class AttendanceLogType extends ENUM {
    static ENUM = {
        CHECK_IN: 'check_in',
        CHECK_OUT: 'check_out',
        UPDATE: 'update',
        BULK_CREATE: 'bulk_create'
    };
}

exports.AttendanceLogType = AttendanceLogType;
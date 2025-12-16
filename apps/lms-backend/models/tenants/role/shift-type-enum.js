const { ENUM } = require('../../common/enum');

class ShiftType extends ENUM {
    static ENUM = {
        DAY: 'day',
        NIGHT: 'night'
    };
}

exports.ShiftType = ShiftType;

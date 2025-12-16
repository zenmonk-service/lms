const { ENUM } = require('./enum');

class Action extends ENUM {
    static ENUM= {
        CREATE:'create',
        READ:'read',
        UPDATE:'update',
        DELETE:'delete',
        APPROVE:'approve',
        REJECT:'reject',
        RECOMMEND:'recommend',
        CANCEL:'cancel',
        CHECK_IN:'check_in',
        CHECK_OUT:'check_out',
        ACTIVATE:'activate',
        DEACTIVATE:'deactivate',
        CREATE_BULK:'create_bulk',
        REPORT:'report'

    }
}

exports.Action = Action;
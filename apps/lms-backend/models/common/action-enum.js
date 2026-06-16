const { ENUM } = require('./enum');

class Action extends ENUM {
    static ENUM= {
        CREATE:'create',
        READ:'read',
        UPDATE:'update',
        DELETE:'delete',
        APPROVE:'approve',
        CANCEL:'cancel',
        ACTIVATE:'activate',
        CREATE_BULK:'create_bulk',
        REPORT:'report'

    }
}

exports.Action = Action;
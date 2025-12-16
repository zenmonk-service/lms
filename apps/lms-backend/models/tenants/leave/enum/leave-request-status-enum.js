const { ENUM } = require("../../../common/enum");

class LeaveRequestStatus extends ENUM {
    static ENUM = {
        PENDING: "Pending",
        APPROVED: "Approved",
        REJECTED: "Rejected",
        CANCELLED: "Cancelled",
        RECOMMENDED: "Recommended",
    };
}

exports.LeaveRequestStatus = LeaveRequestStatus;
const router = require("express").Router();
const { userControllers, leaveTypeControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/:user_uuid/leave-requests")
    .get(userControllers.getLeaveRequestsOfUser)
    .post(userControllers.createLeaveRequestForUser)

router.route("/:user_uuid/leave-types")
    .get(leaveTypeControllers.getFilteredLeaveTypes)

router.route("/:user_uuid/leave-requests/:leave_request_uuid")
    .get(userControllers.getLeaveRequestOfUser)
    .put(userControllers.updateLeaveRequestOfUser)
    .delete(userControllers.deleteLeaveRequestOfUser)
    

 module.exports = router;
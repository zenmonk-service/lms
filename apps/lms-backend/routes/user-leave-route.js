const router = require("express").Router();
const { userControllers, leaveTypeControllers } = require("../controllers");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/:user_uuid/leave-requests")
    .get(validateUser(),userControllers.getLeaveRequestsOfUser)
    .post(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.CREATE),userControllers.createLeaveRequestForUser)

router.route("/:user_uuid/leave-types")
    .get(leaveTypeControllers.getFilteredLeaveTypes)

router.route("/:user_uuid/leave-requests/:leave_request_uuid")
    .get(userControllers.getLeaveRequestOfUser)
    .put(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),userControllers.updateLeaveRequestOfUser)
    .delete(userControllers.deleteLeaveRequestOfUser)
    

 module.exports = router;
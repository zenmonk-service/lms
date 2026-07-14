const router = require("express").Router();
const { userControllers, leaveTypeControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/:user_uuid/leave-requests")
    .get(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),userControllers.getLeaveRequestsOfUser)
    .post(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.CREATE),userControllers.createLeaveRequestForUser)

router.route("/:user_uuid/leave-types")
    .get(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),leaveTypeControllers.getFilteredLeaveTypes)

router.route("/:user_uuid/leave-requests/:leave_request_uuid")
    .get(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),userControllers.getLeaveRequestOfUser)
    .put(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.UPDATE),userControllers.updateLeaveRequestOfUser)
    .delete(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.DELETE),userControllers.deleteLeaveRequestOfUser)
    

 module.exports = router;
const router = require("express").Router();
const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/:user_uuid/leave-requests")
    .get(acl(Permission.ENUM.USER_LEAVE_MANAGEMENT, Action.ENUM.READ),userControllers.getLeaveRequestsOfUser)
    .post(acl(Permission.ENUM.USER_LEAVE_MANAGEMENT, Action.ENUM.CREATE),userControllers.createLeaveRequestForUser)

router.route("/:user_uuid/leave-requests/:leave_request_uuid")
    .get(acl(Permission.ENUM.USER_LEAVE_MANAGEMENT, Action.ENUM.READ),userControllers.getLeaveRequestOfUser)
    .put(acl(Permission.ENUM.USER_LEAVE_MANAGEMENT, Action.ENUM.UPDATE),userControllers.updateLeaveRequestOfUser)
    .delete(acl(Permission.ENUM.USER_LEAVE_MANAGEMENT, Action.ENUM.DELETE),userControllers.deleteLeaveRequestOfUser)
    

 module.exports = router;
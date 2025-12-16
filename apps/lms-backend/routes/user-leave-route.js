const router = require("express").Router();
const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");

router.route("/:user_uuid/leave-requests")
    .get(userControllers.getLeaveRequestsOfUser)
    .post(userControllers.createLeaveRequestForUser)

router.route("/:user_uuid/leave-requests/:leave_request_uuid")
    .get(userControllers.getLeaveRequestOfUser)
    .put(userControllers.updateLeaveRequestOfUser)
    .delete(userControllers.deleteLeaveRequestOfUser)
    

 module.exports = router;
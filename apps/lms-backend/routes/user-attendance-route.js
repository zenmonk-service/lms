const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");

const router = require("express").Router();


router.patch("/:user_uuid/check-in",userControllers.recordUserCheckIn);
router.patch("/:user_uuid/check-out",userControllers.recordUserCheckOut);
router.get("/:user_uuid/attendances",userControllers.getUserAttendance);

module.exports = router;
const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

const router = require("express").Router();


router.patch("/:user_uuid/check-in",userControllers.recordUserCheckIn);
router.patch("/:user_uuid/check-out",userControllers.recordUserCheckOut);
router.get("/:user_uuid/attendances",userControllers.getUserAttendance);

module.exports = router;
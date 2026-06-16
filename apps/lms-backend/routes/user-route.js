const {  userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

const router = require("express").Router();

router.route("/").post(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE),userControllers.createUser)
.get(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),userControllers.getFilteredUsers)
router.route("/verify").post(userControllers.verifyUser);
router.route("/by-email").get(userControllers.getUserByEmail);
router.route("/:user_uuid").put(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.UPDATE),userControllers.updateUser);
router.route("/:user_uuid/notifications").get(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),userControllers.getUserNotifications);
router
	.route("/:user_uuid/documents")
	.get(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),userControllers.getUserDocuments)
	.post(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE),userControllers.createUserDocument);
router
	.route("/:user_uuid/documents/:document_uuid")
	.delete(acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.DELETE),userControllers.deleteUserDocument);
router.route("/:user_id/organizations").get(userControllers.listUserOrganizations);
router.route("/:user_uuid/password").put(userControllers.updatePassword);
router.patch("/:user_uuid/activate",acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.ACTIVATE), userControllers.activateUser)
router.patch("/:user_uuid/deactivate",acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.ACTIVATE), userControllers.deactivateUser)


module.exports = router;

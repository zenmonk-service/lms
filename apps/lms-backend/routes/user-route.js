const {  userControllers } = require("../controllers");

const router = require("express").Router();

router.route("/").post(userControllers.createUser)
.get(userControllers.getFilteredUsers)
router.route("/verify").post(userControllers.verifyUser);
router.route("/by-email").get(userControllers.getUserByEmail);
router.route("/:user_uuid").put(userControllers.updateUser);
router.route("/:user_id/organizations").get(userControllers.listUserOrganizations);
router.route("/:user_uuid/password").put(userControllers.updatePassword);
router.patch("/:user_uuid/activate", userControllers.activateUser)
router.patch("/:user_uuid/deactivate", userControllers.deactivateUser)


module.exports = router;

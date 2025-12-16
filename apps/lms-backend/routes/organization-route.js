const { organizationControllers, userControllers } = require("../controllers");

const router = require("express").Router();

router
  .route("/")
  .get(organizationControllers.getFilteredOrganization)
  .post(organizationControllers.createOrganization);

// router
//   .route("/:organization_uuid")
//   .put(organizationControllers.updateOrganization);
router.route("/:organization_uuid/users").post(userControllers.createUser);
router
  .route("/:organization_uuid/login")
  .post(organizationControllers.loggedInOrganization);
router.route("/").post(organizationControllers.createOrganization);
router
  .route("/:organization_uuid")
  .get(organizationControllers.getOrganizationByUUID);

router.patch(
  "/:organization_uuid/activate",
  organizationControllers.activateOrganization
);

router.patch(
  "/:organization_uuid/deactivate",
  organizationControllers.deactivateOrganization
);

module.exports = router;

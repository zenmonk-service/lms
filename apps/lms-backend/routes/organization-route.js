const { organizationControllers, userControllers } = require("../controllers");

const router = require("express").Router();

router
  .route("/")
  .get(organizationControllers.getFilteredOrganization)
  .post(organizationControllers.createOrganization);

router
  .route("/shifts")
  .get(organizationControllers.listOrganizationShifts);

router.route("/:organization_uuid/users").post(userControllers.createUser);

router
.route("/:organization_uuid/login")
.post(organizationControllers.loggedInOrganization);

router.patch(
  "/:organization_uuid/activate",
  organizationControllers.activateOrganization
);

router.patch(
  "/:organization_uuid/deactivate",
  organizationControllers.deactivateOrganization
);

router
  .route("/:organization_uuid")
  .get(organizationControllers.getOrganizationByUUID)
  .put(organizationControllers.updateOrganization);


module.exports = router;

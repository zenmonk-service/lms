const { organizationControllers } = require("../controllers");
const { validateSuperuser } = require("../middleware/acl-middleware");

const router = require("express").Router();

router
  .route("/")
  .get(validateSuperuser(),organizationControllers.getFilteredOrganization)
  .post(validateSuperuser(),organizationControllers.createOrganization)
  .put(validateSuperuser(),organizationControllers.updateOrganization);

router.patch(
  "/:organization_uuid/activate",validateSuperuser(),
  organizationControllers.activateOrganization,
);

router.patch(
  "/:organization_uuid/deactivate",validateSuperuser(),
  organizationControllers.deactivateOrganization,
);

router
  .route("/:organization_uuid")
  .get(validateSuperuser(),organizationControllers.getOrganizationByUUID)
  .put(validateSuperuser(),organizationControllers.updateOrganization);

module.exports = router;

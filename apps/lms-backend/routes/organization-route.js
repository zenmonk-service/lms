const { organizationControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

const router = require("express").Router();

router
  .route("/")
  .get(organizationControllers.getFilteredOrganization)
  .post(organizationControllers.createOrganization);
router.route("/shifts").get(organizationControllers.listOrganizationShifts);

router
  .route("/events")
  .get(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationEvents)
  .post(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationEvent);

router
  .route("/events/:event_uuid")
  .put(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganizationEvent)
  .delete(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.DELETE),organizationControllers.deleteOrganizationEvent);

router.patch(
  "/:organization_uuid/activate",
  organizationControllers.activateOrganization,
);

router.patch(
  "/:organization_uuid/deactivate",
  organizationControllers.deactivateOrganization,
);

router
  .route("/:organization_uuid")
  .get(organizationControllers.getOrganizationByUUID)
  .put(organizationControllers.updateOrganization);

module.exports = router;

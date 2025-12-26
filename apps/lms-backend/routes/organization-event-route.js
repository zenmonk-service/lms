const router = require("express").Router();
const { organizationControllers } = require("../controllers");
const {acl}  = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

// router
//   .route("/:organization_uuid/events")
//   .get(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationEvents)
//   .post(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationEvent);

// router.route("/:organization_uuid/events/:event_uuid")
//   .put(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganizationEvent)
//   .delete(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.DELETE),organizationControllers.deleteOrganizationEvent)

router.route("/:organization_uuid/events")
  .get(organizationControllers.getOrganizationEvents)
  .post(organizationControllers.addOrganizationEvent);

router.route("/:organization_uuid/events/:event_uuid")
  .put(organizationControllers.updateOrganizationEvent)
  .delete(organizationControllers.deleteOrganizationEvent)
  
module.exports = router;
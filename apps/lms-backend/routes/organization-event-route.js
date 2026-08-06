const express = require("express");
const { organizationControllers } = require("../controllers");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const { acl } = require("../middleware/acl-middleware");
const router = express.Router();

router
  .route("/")
  .get(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.READ),organizationControllers.getOrganizationEvents)
  .post(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationEvent);

router
  .route("/:event_uuid")
  .put(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.UPDATE),organizationControllers.updateOrganizationEvent)
  .delete(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.DELETE),organizationControllers.deleteOrganizationEvent);

module.exports = router;

const express = require("express");
const { organizationControllers } = require("../controllers");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const { acl } = require("../middleware/acl-middleware");
const router = express.Router();

router
  .route("/")
  .get(organizationControllers.getOrganizationEvents)
  .post(acl(Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT, Action.ENUM.CREATE),organizationControllers.addOrganizationEvent);

router
  .route("/:event_uuid")
  .put(organizationControllers.updateOrganizationEvent)
  .delete(organizationControllers.deleteOrganizationEvent);

module.exports = router;

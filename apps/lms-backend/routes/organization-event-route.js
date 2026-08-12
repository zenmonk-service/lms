const express = require("express");
const { organizationControllers } = require("../controllers");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const { acl, validateUser } = require("../middleware/acl-middleware");
const router = express.Router();

router
  .route("/")
  .get(validateUser(),organizationControllers.getOrganizationEvents)
  .post(validateUser(),organizationControllers.addOrganizationEvent);

router
  .route("/:event_uuid")
  .put(validateUser(),organizationControllers.updateOrganizationEvent)
  .delete(organizationControllers.deleteOrganizationEvent);

module.exports = router;

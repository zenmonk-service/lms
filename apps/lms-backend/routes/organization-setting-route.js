const { organizationSettingControllers, organizationControllers } = require("../controllers");
const express = require("express");
const { acl } = require("../middleware/acl-middleware");
const { Permission } = require("../models/common/permission-enum");
const { Action } = require("../models/common/action-enum");
const router = express.Router();

router
  .route("/settings")
  .get(organizationSettingControllers.getOrganizationSetting)
  .post(organizationSettingControllers.createOrganizationSetting)
  .put(organizationSettingControllers.updateOrganizationSetting);
router.route("/shifts").get(organizationControllers.listOrganizationShifts);

module.exports = router;

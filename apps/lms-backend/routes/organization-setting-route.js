const { organizationSettingControllers } = require("../controllers");
const express = require("express");
const { acl } = require("../middleware/acl-middleware");
const { Permission } = require("../models/common/permission-enum");
const { Action } = require("../models/common/action-enum");
const router = express.Router();

router
  .route("/settings")
  .get(acl(Permission.ENUM.ORGANIZATION_SETTING_MANAGEMENT, Action.ENUM.READ),organizationSettingControllers.getOrganizationSetting)
  .post(acl(Permission.ENUM.ORGANIZATION_SETTING_MANAGEMENT, Action.ENUM.UPDATE),organizationSettingControllers.createOrganizationSetting)
  .put(acl(Permission.ENUM.ORGANIZATION_SETTING_MANAGEMENT, Action.ENUM.UPDATE),organizationSettingControllers.updateOrganizationSetting);

module.exports = router;

const { organizationSettingControllers, organizationControllers } = require("../controllers");
const express = require("express");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Permission } = require("../models/common/permission-enum");
const { Action } = require("../models/common/action-enum");
const router = express.Router();

router
  .route("/settings")
  .get(validateUser(), organizationSettingControllers.getOrganizationSetting)
  .post(acl(Permission.ENUM.ORGANIZATION_SETTING_MANAGEMENT, Action.ENUM.UPDATE),organizationSettingControllers.createOrganizationSetting)
router
  .route("/settings/:uuid").put( acl(Permission.ENUM.ORGANIZATION_SETTING_MANAGEMENT, Action.ENUM.UPDATE),organizationSettingControllers.updateOrganizationSetting);
router.route("/shifts").get(organizationControllers.listOrganizationShifts);

module.exports = router;

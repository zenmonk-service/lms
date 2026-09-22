const { organizationSettingControllers, organizationControllers } = require("../controllers");
const express = require("express");
const { acl } = require("../middleware/acl-middleware");
const { Permission, Action } = require("@repo/common");
const router = express.Router();

router
  .route("/settings")
  .get(organizationSettingControllers.getOrganizationSetting)
  .post(organizationSettingControllers.createOrganizationSetting)
  .put(organizationSettingControllers.updateOrganizationSetting);
router.route("/shifts").get(organizationControllers.listOrganizationShifts);

module.exports = router;

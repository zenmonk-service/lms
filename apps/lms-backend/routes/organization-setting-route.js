const { organizationSettingControllers } = require("../controllers");
const express = require("express");
const router = express.Router();

router
  .route("/settings")
  .get(organizationSettingControllers.getOrganizationSetting)
  .post(organizationSettingControllers.createOrganizationSetting)
  .put(organizationSettingControllers.updateOrganizationSetting);

module.exports = router;

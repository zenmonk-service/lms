const router = require("express").Router();
const { permissionController } = require("../controllers");

router
  .route("/")
  .get(permissionController.listPermissions)

module.exports = router;

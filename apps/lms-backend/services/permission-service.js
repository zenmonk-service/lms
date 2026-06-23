const {
  permissionRepository,
} = require("../repositories/permission-repository");

exports.listPermissions = async () => {
  return await permissionRepository.findAll();
};

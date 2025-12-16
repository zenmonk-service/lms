const { permissionRepository } = require("../repositories/permission-repository");

exports.listPermissions = async (payload) => {

 return await permissionRepository.findAll();

};
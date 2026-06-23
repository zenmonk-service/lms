const { runWithSchema, getPublicSchema } = require("../lib/schema");
const { organizationRepository } = require("../repositories/organization-repository");
const { UnauthorizedError, NotFoundError } = require("./error");

exports.changeSchema = async (req, res, next) => {
  const uuid = req.headers["org_uuid"];
  console.log('uuid: ', uuid);
  if (uuid && uuid !== getPublicSchema()) {
    const organization = await organizationRepository.findOne({ uuid });
    if (!organization) {
      throw new NotFoundError("Organization Not found");
    }
    if (!organization.is_active) {
      throw new UnauthorizedError(
        "Organization is deactivated. Please contact administrator.",
      );
    }
  }
  runWithSchema(uuid, next);
};

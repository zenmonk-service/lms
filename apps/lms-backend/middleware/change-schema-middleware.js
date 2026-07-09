const { getPublicSchema, runWithSchema } = require("../lib/schema");
const { organizationRepository } = require("../repositories/organization-repository");
const { NotFoundError, UnauthorizedError } = require("./error");

exports.changeSchema = async (req, res, next) => {
    try {
        const uuid = req.headers["org_uuid"];

        if (uuid && uuid !== getPublicSchema()) {
            const organization = await organizationRepository.findOne({ uuid });

            if (!organization) {
                return next(new NotFoundError("Organization not found"));
            }

            if (!organization.is_active) {
                return next(new UnauthorizedError(
                    "Organization is deactivated. Please contact administrator.",
                ));
            }
        }

        return runWithSchema(uuid, () => next());

    } catch (error) {
        next(error);
    }
};
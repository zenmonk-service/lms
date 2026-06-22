const { AsyncLocalStorage } = require("async_hooks");
const { organizationRepository } = require("../repositories/organization-repository");
const { NotFoundError, UnauthorizedError } = require("../middleware/error");

const schemaStorage = new AsyncLocalStorage();
let fallbackSchema = process.env.DB_PUBLIC_SCHEMA;

function getPublicSchema() {
  return process.env.DB_PUBLIC_SCHEMA;
}

async function resolveSchema(uuid) {
  if (uuid && uuid !== getPublicSchema()) {
    const organization = await organizationRepository.findOne({uuid});
    if(!organization) {
      throw new NotFoundError('Organization Not found')
    }
    if(organization.is_active) {
      throw new UnauthorizedError("Organization is deactivated. Please contact administrator.");
    }
    return `org_${uuid}`;
  }
  return getPublicSchema();
}

function runWithSchema(uuid, callback) {
  return schemaStorage.run({ schema: resolveSchema(uuid) }, callback);
}

function setSchema(uuid) {
  const schema = resolveSchema(uuid);
  const store = schemaStorage.getStore();

  if (store) {
    store.schema = schema;
    return;
  }

  fallbackSchema = schema;
}

function getSchema() {
  return (
    schemaStorage.getStore()?.schema || fallbackSchema || getPublicSchema()
  );
}

module.exports = { runWithSchema, setSchema, getSchema };

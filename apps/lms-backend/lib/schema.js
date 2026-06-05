const { AsyncLocalStorage } = require("async_hooks");

const schemaStorage = new AsyncLocalStorage();
let fallbackSchema = process.env.DB_PUBLIC_SCHEMA;

function getPublicSchema() {
  return process.env.DB_PUBLIC_SCHEMA || "public";
}

function resolveSchema(uuid) {
  if (uuid && uuid !== getPublicSchema()) return `org_${uuid}`;
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
  return schemaStorage.getStore()?.schema || fallbackSchema || getPublicSchema();
}

module.exports = { runWithSchema, setSchema, getSchema };

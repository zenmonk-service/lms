let activeSchema = process.env.DB_PUBLIC_SCHEMA;

function setSchema(uuid) {
  if (uuid != process.env.DB_PUBLIC_SCHEMA && uuid) {
    activeSchema = `org_${uuid}`;
  } else {
    activeSchema = process.env.DB_PUBLIC_SCHEMA;
  }
}

function getSchema() {
  return activeSchema;
}

module.exports = { setSchema, getSchema };


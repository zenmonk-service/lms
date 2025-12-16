"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const { sequelize } = require("../config/db-connection");

const db = {};

// Helper function to load models recursively
function loadModelsFromDir(dir, schemaKey) {
  fs.readdirSync(dir).forEach((item) => {
    const itemPath = path.join(dir, item);

    if (fs.statSync(itemPath).isDirectory()) {
      // If folder, go deeper
      loadModelsFromDir(itemPath, schemaKey);
    } else if (item.endsWith("model.js")) {
      // If it's a model file, load it
      const model = require(itemPath)(sequelize, Sequelize.DataTypes);

      // Ensure schema object exists in db (db.public / db.tenants)
      if (!db[schemaKey]) db[schemaKey] = {};

      // Store as db.public.ModelName OR db.tenants.ModelName
      db[schemaKey][model.tableName] = model;
    }
  });
}

// Top-level schemas (public, tenants)
["public", "tenants"].forEach((schemaFolder) => {
  const schemaPath = path.join(__dirname, schemaFolder);
  if (fs.existsSync(schemaPath)) {
    loadModelsFromDir(schemaPath, schemaFolder);
  }
});

// Run associations for each schema
Object.keys(db).forEach((schemaKey) => {
  Object.keys(db[schemaKey]).forEach((modelName) => {
    if (db[schemaKey][modelName].associate) {
      db[schemaKey][modelName].associate(db[schemaKey]);
    }
  });
});

// Attach sequelize instance
db.sequelize = sequelize;

module.exports = db;

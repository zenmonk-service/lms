"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "role_permission",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        permission_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: "unique_index",
          references: {
            model:"permission",
            key: "id",
          },
          validate: {
            notNull: {
              msg: "Permission ID is required",
            },
            notEmpty: {
              msg: "Permission ID cannot be empty",
            },
          },
        },
        role_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: "unique_index",
          references: {
            model: "role",
            key: "id",
          },
          validate: {
            notNull: {
              msg: "Role ID is required",
            },
            notEmpty: {
              msg: "Role ID cannot be empty",
            },
          },
        },
      },
      {
        schema,
        uniqueKeys: {
          unique_index: {
            fields: ["permission_id", "role_id"],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("role_permission", { schema });
  },
};

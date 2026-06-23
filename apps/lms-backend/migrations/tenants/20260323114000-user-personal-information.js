"use strict";

const { Gender } = require("../../models/tenants/user/enum/gender-enum");
const { MaritalStatus } = require("../../models/tenants/user/enum/marital-status-enum");
const { WorkMode } = require("../../models/tenants/user/enum/work-mode-enum");

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "user_personal_information",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        marital_status: {
          type: DataTypes.ENUM(MaritalStatus.getValues()),
          allowNull: true,
        },
        dob: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        gender: {
          type: DataTypes.ENUM(Gender.getValues()),
          allowNull: true,
        },
        work_mode: {
          type: DataTypes.ENUM(WorkMode.getValues()),
          allowNull: true,
        },
        work_branch: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        parent_information: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        guardian_information: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        current_address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        permanent_address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        deletedAt: {
          type: DataTypes.DATE,
          field: "deleted_at",
          allowNull: true,
        },
      },
      { schema }
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.dropTable("user_personal_information", { schema });
  },
};
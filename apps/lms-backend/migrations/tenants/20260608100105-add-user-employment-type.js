"use strict";

const { EmployementType, WorkMode } = require("@repo/common");

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: "user",
        schema,
      },
      "employment_type",
      {
        type: DataTypes.ENUM(EmployementType.getValues()),
        allowNull: false,
        defaultValue: EmployementType.ENUM.FULL_TIME,
      },
    );
    await queryInterface.addColumn(
      {
        tableName: "user",
        schema,
      },
      "work_mode",
      {
        type: DataTypes.ENUM(WorkMode.getValues()),
        allowNull: true,
      },
    );
    await queryInterface.addColumn(
      {
        tableName: "user",
        schema,
      },
      "work_branch",
      {
        type: DataTypes.STRING,
        allowNull: true,
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "work_branch",
    );
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "work_mode",
    );
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "employment_type",
    );
  },
};

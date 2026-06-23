"use strict";

const { EmployementType } = require("../../models/tenants/user/enum/employment-type-enum");

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
        defaultValue: EmployementType.ENUM.FULL_TIME
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "employment_type",
    );
  },
};

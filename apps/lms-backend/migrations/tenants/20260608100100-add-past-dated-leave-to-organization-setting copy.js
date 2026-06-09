"use strict";

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "past_dated_leave",
      {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "past_dated_leave",
    );
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: "leave_request",
        schema,
      },
      "penalty",
      {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "leave_request",
        schema,
      },
      "penalty",
    );
  },
};

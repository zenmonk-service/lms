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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      }
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

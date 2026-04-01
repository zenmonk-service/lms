"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.addColumn(
      { tableName: "user", schema },
      "marital_status",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.removeColumn(
      { tableName: "user", schema },
      "marital_status"
    );
  },
};

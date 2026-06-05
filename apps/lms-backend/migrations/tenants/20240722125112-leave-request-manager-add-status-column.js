"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.addColumn(
      {
        tableName: "leave_request_manager",
        schema,
      },
      "status_changed_to",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.removeColumn(
      {
        tableName: "leave_request_manager",
        schema,
      },
      "status_changed_to"
    );
  },
};

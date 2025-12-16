"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.changeColumn(
      {
        tableName: "leave_request",
        schema,
      },
      "status_changed_by",
      {
        type: DataTypes.ARRAY(DataTypes.JSONB) + 'USING CAST("status_changed_by" as ' + DataTypes.ARRAY(DataTypes.JSONB) + ')',
        allowNull: true,
      },
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.changeColumn(
      {
        tableName: "leave_request",
        schema,
      },
      "status_changed_by",
      {
        type: DataTypes.STRING,
        allowNull: true,
      },
    );
  },
};

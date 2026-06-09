"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.addColumn(
      { tableName: "leave_balance", schema },
      "uuid",
      {
        type: DataTypes.UUID,
        defaultValue: DataTypes.fn("uuid_generate_v4"),
        allowNull: false,
        unique: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: "leave_balance", schema },
      "sla",
      {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: "leave_balance", schema },
      "final_balance",
      {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.removeColumn(
      { tableName: "leave_balance", schema },
      "final_balance",
    );

    await queryInterface.removeColumn(
      { tableName: "leave_balance", schema },
      "sla",
    );

    await queryInterface.removeColumn(
      { tableName: "leave_balance", schema },
      "uuid",
    );
  },
};

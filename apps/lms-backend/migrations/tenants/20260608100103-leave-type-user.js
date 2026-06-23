"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "user_leave_type",
      {
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        leave_type_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "leave_type",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
      },
      { schema },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("user_leave_type", { schema });
  },
};
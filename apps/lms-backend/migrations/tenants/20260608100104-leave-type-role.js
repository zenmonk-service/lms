"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "role_leave_type",
      {
        role_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "role",
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
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
      },
      { schema },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("role_leave_type", { schema });
  },
};
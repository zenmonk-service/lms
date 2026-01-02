"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "organization_shift",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
          defaultValue: DataTypes.fn("uuid_generate_v4"),
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        effective_hours: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        flexible_time :{
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '00:00:00',
        },
        start_time:{
          type: DataTypes.TIME,
          allowNull: false,
        },
        end_time:{
          type: DataTypes.TIME,
          allowNull: false,
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
        deletedAt: {
          type: DataTypes.DATE,
          field: "deleted_at",
        },
      },
      { schema }
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("organization_shift", schema);
  },
};

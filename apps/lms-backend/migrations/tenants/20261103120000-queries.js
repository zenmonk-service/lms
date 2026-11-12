"use strict";

const { QueryPriority, QueryStatus } = require("@repo/common");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "queries",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.fn("gen_random_uuid"),
          allowNull: false,
          unique: true,
        },
        ticket_number: {
          type: DataTypes.STRING(32),
          allowNull: false,
          unique: true,
        },
        creator_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
          onDelete: "RESTRICT",
        },
        module: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        subject: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        priority: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: QueryPriority.ENUM.MEDIUM,
        },
        status: {
          type: DataTypes.STRING(30),
          allowNull: false,
          defaultValue: QueryStatus.ENUM.OPEN,
        },
        resolved_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
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
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      { schema },
    );

    await queryInterface.addIndex(
      { tableName: "queries", schema },
      ["uuid"],
      { name: "queries_uuid_idx", unique: true },
    );

    await queryInterface.addIndex(
      { tableName: "queries", schema },
      ["status"],
      { name: "queries_status_idx" },
    );

    await queryInterface.addIndex(
      { tableName: "queries", schema },
      ["creator_id"],
      { name: "queries_creator_id_idx" },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("queries", { schema });
  },
};

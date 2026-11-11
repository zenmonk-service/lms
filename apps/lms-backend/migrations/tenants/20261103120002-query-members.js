"use strict";

const { QueryMemberRole } = require("@repo/common");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "query_members",
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
        query_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "queries",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        role: {
          type: DataTypes.STRING(30),
          allowNull: false,
          defaultValue: QueryMemberRole.ENUM.ASSIGNEE,
        },
        assigned_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: {
            model: "user",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        assigned_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
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
      { tableName: "query_members", schema },
      ["uuid"],
      { name: "query_members_uuid_idx", unique: true },
    );

    await queryInterface.addIndex(
      { tableName: "query_members", schema },
      ["query_id", "user_id", "role"],
      {
        name: "query_members_query_user_role_unique",
        unique: true,
      },
    );

    await queryInterface.addIndex(
      { tableName: "query_members", schema },
      ["user_id"],
      { name: "query_members_user_id_idx" },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("query_members", { schema });
  },
};

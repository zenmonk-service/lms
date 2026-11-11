"use strict";

const { QueryMessageType } = require("@repo/common");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "query_messages",
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
        sender_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: {
            model: "user",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        message_type: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: QueryMessageType.ENUM.PUBLIC,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        attachment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: {
            model: "attachment",
            key: "id",
          },
          onDelete: "SET NULL",
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
      { tableName: "query_messages", schema },
      ["uuid"],
      { name: "query_messages_uuid_idx", unique: true },
    );

    await queryInterface.addIndex(
      { tableName: "query_messages", schema },
      ["query_id"],
      { name: "query_messages_query_id_idx" },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("query_messages", { schema });
  },
};

"use strict";

const { UserDocumentType } = require("../../models/tenants/user/enum/user-document-type-enum");

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "user_document",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.fn("uuid_generate_v4"),
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: "user", schema },
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        document_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        document_type: {
          type: DataTypes.ENUM(UserDocumentType.getValues()),
          allowNull: false,
        },
        document_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        file_urls: {
          type: DataTypes.JSONB,
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

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.dropTable("user_document", { schema });
  },
};

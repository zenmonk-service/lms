const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const Period = require("../../../lib/period");

module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    static user_document;
    static leave_request;

    static associate(models) {
      this.user_document = Attachment.belongsTo(models.user_document, {
        foreignKey: "user_document_id",
        as: "user_document",
      });
      this.leave_request = Attachment.belongsTo(models.leave_request, {
        foreignKey: "leave_request_id",
        as: "leave_request",
      });
    }
  }

  Attachment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "User ID is required.",
          },
          notNull: {
            msg: "User ID is required.",
          },
        },
      },
      user_document_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user_document",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      leave_request_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "leave_request",
          key: "id",
        },
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "File name is required.",
          },
          notNull: {
            msg: "File name is required.",
          },
        },
      },
      meta_data: {
        type: DataTypes.JSONB,
        allowNull: true,
        //   validate: {
        //     uploadedFileNames(value) {
        //       if (!value || !Array.isArray(value.uploaded_file_names)) {
        //         throw new Error("metadata.uploaded_file_names must be an array.");
        //       }

        //       if (value.uploaded_file_names.length !== this.file_urls.length) {
        //         throw new Error(
        //           "uploaded_file_names and file_urls must have the same length.",
        //         );
        //       }
        //     },
        //   },
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "File URL is required.",
          },
          notNull: {
            msg: "File URL is required.",
          },
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      underscored: true,
      tableName: "attachment",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Attachment;
};

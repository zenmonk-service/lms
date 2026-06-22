const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const { UserDocumentType } = require("./enum/user-document-type-enum");

module.exports = (sequelize, DataTypes) => {
  class UserDocument extends Model {
    static user;

    static associate(models) {
      this.user = UserDocument.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        user_id: undefined,
      };
    }
  }

  UserDocument.init(
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
            if (!isValidUUID(value)) {
              throw new Error("Invalid UUID format.");
            }
          },
          notEmpty: {
            msg: "Document UUID is required.",
          },
          notNull: {
            msg: "Document UUID is required.",
          },
        },
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },

      document_type: {
        type: DataTypes.ENUM(UserDocumentType.getValues()),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Document Type is required.",
          },
          notNull: {
            msg: "Document Type is required.",
          },
          isIn: {
            args: [UserDocumentType.getValues()],
            msg: "Invalid Document Type.",
          },
        },
      },

      document_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      file_urls: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("file_urls must be an array.");
            }

            if (value.length == 0) {
              throw new Error("file urls must contain atleast one url.");
            }
          },
        },
      },

      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          uploadedFileNames(value) {
            if (!value || !Array.isArray(value.uploaded_file_names)) {
              throw new Error("metadata.uploaded_file_names must be an array.");
            }

            if (value.uploaded_file_names.length !== this.file_urls.length) {
              throw new Error(
                "uploaded_file_names and file_urls must have the same length.",
              );
            }
          },
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "user_document",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return UserDocument;
};

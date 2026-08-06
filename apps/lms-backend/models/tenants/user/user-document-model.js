const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const { UserDocumentType } = require("./enum/user-document-type-enum");

module.exports = (sequelize, DataTypes) => {
  class UserDocument extends Model {
    static user;
    static attachments;

    static associate(models) {
      this.user = UserDocument.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });

      this.attachments = UserDocument.hasMany(models.attachment, {
        foreignKey: "user_document_id",
        as: "attachments",
      });
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

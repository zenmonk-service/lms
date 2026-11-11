const { Model } = require("sequelize");
const { QueryMessageType } = require("@repo/common");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {
  class QueryMessage extends Model {
    static query;
    static sender;
    static attachment;

    static associate(models) {
      this.query = QueryMessage.belongsTo(models.queries, {
        foreignKey: "query_id",
        as: "query",
      });
      this.sender = QueryMessage.belongsTo(models.user, {
        foreignKey: "sender_id",
        as: "sender",
      });
      this.attachment = QueryMessage.belongsTo(models.attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }

    isPublic() {
      return this.getDataValue("message_type") === QueryMessageType.ENUM.PUBLIC;
    }

    isInternal() {
      return this.getDataValue("message_type") === QueryMessageType.ENUM.INTERNAL;
    }

    isSystem() {
      return this.getDataValue("message_type") === QueryMessageType.ENUM.SYSTEM;
    }
  }

  QueryMessage.init(
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
        unique: true,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
        },
      },
      query_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "queries",
          key: "id",
        },
        onDelete: "CASCADE",
        validate: {
          notEmpty: {
            msg: "Query id is required.",
          },
          notNull: {
            msg: "Query id is required.",
          },
        },
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "user",
          key: "id",
        },
      },
      message_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: QueryMessageType.ENUM.PUBLIC,
        validate: {
          isIn: {
            args: [QueryMessageType.getValues()],
            msg: `Invalid message type. Allowed values: ${QueryMessageType.getValues().join(", ")}`,
          },
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Content is required.",
          },
          notNull: {
            msg: "Content is required.",
          },
        },
      },
      attachment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "attachment",
          key: "id",
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "query_messages",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return QueryMessage;
};

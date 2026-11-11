const { Model } = require("sequelize");
const { QueryMemberRole } = require("@repo/common");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {
  class QueryMember extends Model {
    static query;
    static user;
    static assigner;

    static associate(models) {
      this.query = QueryMember.belongsTo(models.queries, {
        foreignKey: "query_id",
        as: "query",
      });
      this.user = QueryMember.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
      this.assigner = QueryMember.belongsTo(models.user, {
        foreignKey: "assigned_by",
        as: "assigner",
      });
    }

    isPrimaryAssignee() {
      return this.getDataValue("role") === QueryMemberRole.ENUM.PRIMARY_ASSIGNEE;
    }

    isAssignee() {
      return (
        this.getDataValue("role") === QueryMemberRole.ENUM.ASSIGNEE ||
        this.getDataValue("role") === QueryMemberRole.ENUM.PRIMARY_ASSIGNEE
      );
    }

    isResolver() {
      return this.getDataValue("role") === QueryMemberRole.ENUM.RESOLVER;
    }

    isWatcher() {
      return this.getDataValue("role") === QueryMemberRole.ENUM.WATCHER;
    }
  }

  QueryMember.init(
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
        validate: {
          notEmpty: {
            msg: "User id is required.",
          },
          notNull: {
            msg: "User id is required.",
          },
        },
      },
      role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: QueryMemberRole.ENUM.ASSIGNEE,
        validate: {
          isIn: {
            args: [QueryMemberRole.getValues()],
            msg: `Invalid member role. Allowed values: ${QueryMemberRole.getValues().join(", ")}`,
          },
        },
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "user",
          key: "id",
        },
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "query_members",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "query_members_query_user_role_unique",
          unique: true,
          fields: ["query_id", "user_id", "role"],
        },
      ],
    },
  );

  return QueryMember;
};

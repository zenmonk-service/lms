const { Model } = require("sequelize");
const { QueryPriority, QueryStatus, QueryModule } = require("@repo/common");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {
  class Query extends Model {
    static creator;
    static messages;
    static members;

    static associate(models) {
      this.creator = Query.belongsTo(models.user, {
        foreignKey: "creator_id",
        as: "creator",
      });
      this.messages = Query.hasMany(models.query_messages, {
        foreignKey: "query_id",
        as: "messages",
      });
      this.members = Query.hasMany(models.query_members, {
        foreignKey: "query_id",
        as: "members",
      });
    }

    isOpen() {
      return this.getDataValue("status") === QueryStatus.ENUM.OPEN;
    }

    isInProgress() {
      return this.getDataValue("status") === QueryStatus.ENUM.IN_PROGRESS;
    }

    isPendingEmployee() {
      return this.getDataValue("status") === QueryStatus.ENUM.PENDING_EMP;
    }

    isResolved() {
      return this.getDataValue("status") === QueryStatus.ENUM.RESOLVED;
    }

    resolve() {
      this.setDataValue("status", QueryStatus.ENUM.RESOLVED);
      this.setDataValue("resolved_at", new Date());
    }
  }

  Query.init(
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
      ticket_number: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Ticket number is required.",
          },
          notNull: {
            msg: "Ticket number is required.",
          },
        },
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        validate: {
          notEmpty: {
            msg: "Creator id is required.",
          },
          notNull: {
            msg: "Creator id is required.",
          },
        },
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Module is required.",
          },
          notNull: {
            msg: "Module is required.",
          },
          isIn: {
            args: [QueryModule.getValues()],
            msg: `Invalid module. Allowed values: ${QueryModule.getValues().join(", ")}`,
          },
        },
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Subject is required.",
          },
          notNull: {
            msg: "Subject is required.",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Description is required.",
          },
          notNull: {
            msg: "Description is required.",
          },
        },
      },
      priority: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: QueryPriority.ENUM.MEDIUM,
        validate: {
          isIn: {
            args: [QueryPriority.getValues()],
            msg: `Invalid priority. Allowed values: ${QueryPriority.getValues().join(", ")}`,
          },
        },
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: QueryStatus.ENUM.OPEN,
        validate: {
          isIn: {
            args: [QueryStatus.getValues()],
            msg: `Invalid status. Allowed values: ${QueryStatus.getValues().join(", ")}`,
          },
        },
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "queries",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Query;
};

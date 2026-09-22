const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const {
  LeaveBalanceLogSource,
} = require("@repo/common");

module.exports = (sequelize, DataTypes) => {
  class LeaveBalanceLog extends Model {
    static leave_request;
    static leave_balance;
    static settled_against_leave_balance;

    static associate(models) {
      this.leave_request = LeaveBalanceLog.belongsTo(models.leave_request, {
        foreignKey: "leave_request_id",
        as: "leave_request",
      });

      this.leave_balance = LeaveBalanceLog.belongsTo(models.leave_balance, {
        foreignKey: "leave_balance_id",
        as: "leave_balance",
      });
      this.settled_against_leave_balance = LeaveBalanceLog.belongsTo(
        models.leave_balance,
        {
          foreignKey: "settled_against_leave_balance_id",
          as: "settled_against_leave_balance",
        },
      );
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        leave_request_id: undefined,
        leave_balance_id: undefined,
      };
    }
  }

  LeaveBalanceLog.init(
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
            if (!isValidUUID(value)) {
              throw new Error("Invalid UUID.");
            }
          },
        },
      },

      leave_request_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "leave_request",
          key: "id",
        },
      },
      leave_balance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "leave_balance",
          key: "id",
        },
        validate: {
          notNull: { msg: "Leave balance id is required." },
        },
      },

      updated_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: "Deducted amount is required." },
        },
      },
      // Unsigned magnitude of the change this log represents — direction is
      // implied by `source`. Nullable: historical rows predate this column.
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      source: {
        type: DataTypes.ENUM(LeaveBalanceLogSource.getValues()),
        allowNull: false,
        validate: {
          isIn: {
            args: [LeaveBalanceLogSource.getValues()],
            msg: "Invalid leave balance log source.",
          },
        },
      },
      settled_against_leave_balance_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "leave_balance",
          key: "id",
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      underscored: true,
      tableName: "leave_balance_log",
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["leave_request_id"] },
        { fields: ["leave_balance_id"] },
      ],
    },
  );

  return LeaveBalanceLog;
};

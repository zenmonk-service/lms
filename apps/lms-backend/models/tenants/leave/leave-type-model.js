const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const { cleanObject } = require("../../common/clean-object");
const { ConflictError } = require("../../../middleware/error");
const { TimePeriod } = require("../../common/time-period-enum");

module.exports = (sequelize, DataTypes) => {
  class LeaveType extends Model {
    static leave_balances;
    static leave_requests;
    static roles;
    static users;
    static transfer_leave_type;

    static associate(models) {
      this.leave_balances = LeaveType.hasMany(models.leave_balance, {
        foreignKey: "leave_type_id",
        as: "leave_balances",
      });
      this.leave_requests = LeaveType.hasMany(models.leave_request, {
        foreignKey: "leave_type_id",
        as: "leave_requests",
      });

      this.roles = LeaveType.belongsToMany(models.role, {
        through: models.role_leave_type,
        foreignKey: "leave_type_id",
        otherKey: "role_id",
        as: "roles",
      });

      this.users = LeaveType.belongsToMany(models.user, {
        through: models.user_leave_type,
        foreignKey: "leave_type_id",
        otherKey: "user_id",
        as: "users",
      });

      this.transfer_leave_type = LeaveType.belongsTo(models.leave_type, {
        foreignKey: "transfer_leave_type_id",
        as: "transfer_leave_type",
      });
    }

    getAccrual() {
      return this.getDataValue("accrual");
    }

    getLeaveCount() {
      return this.getAccrual()?.leave_count;
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
      };
    }

    isActive() {
      return this.getDataValue("is_active");
    }

    activate() {
      if (this.isActive())
        throw new ConflictError("Leave Type is already activated.");
      this.setDataValue("is_active", true);
    }

    deactivate() {
      if (!this.isActive())
        throw new ConflictError("Leave Type is already deactivated.");
      this.setDataValue("is_active", false);
    }
  }

  LeaveType.init(
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
          notEmpty: {
            msg: "UUID is required.",
          },
          notNull: {
            msg: "UUID is required.",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("name", value?.trim());
        },
        validate: {
          notEmpty: {
            msg: "Name is required.",
          },
          notNull: {
            msg: "Name is required.",
          },
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
          this.setDataValue("code", value?.trim()?.toUpperCase());
        },
        validate: {
          notEmpty: {
            msg: "Code is required.",
          },
          notNull: {
            msg: "Code is required.",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        set(value) {
          this.setDataValue("description", value?.trim() || null);
        },
      },
      max_consecutive_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      allow_negative_leaves: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accrual: {
        type: DataTypes.JSONB,
        allowNull: true,
        set(value) {
          if (!value) return;
          if (typeof value !== "object" || Array.isArray(value))
            throw new Error("Accrual should be a object.");
          this.setDataValue(
            "accrual",
            cleanObject(value, ["period", "applicable_on", "leave_count"]),
          );
        },
        validate: {
          validateAccrual(value) {
            if (!value) return;

            if (!value.period) throw new Error("Accrual period is required.");
            else if (!TimePeriod.isValidValue(value.period))
              throw new Error(
                `Accrual period must be one of: ${TimePeriod.getValues().join(
                  ", ",
                )}.`,
              );

            if (!value.applicable_on)
              throw new Error("Accrual applicable on is required.");

            if (!value.leave_count)
              throw new Error("Accrual leave count is required.");
            else if (typeof value.leave_count !== "number")
              throw new Error("Accrual leave count should be a number.");
            else if (value.leave_count <= 0)
              throw new Error(
                "Accrual leave count should be gretaer than zero.",
              );
          },
        },
      },
      min_waiting_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_sandwich_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_clubbing_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      carry_forward: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      transfer_leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "leave_type",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      is_full_day_applicable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      min_tenure_months: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          isNonNegative(value) {
            if (value != null && value < 0)
              throw new Error("Minimum tenure months cannot be negative.");
          },
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "leave_type",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return LeaveType;
};

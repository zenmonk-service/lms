const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const { cleanObject } = require("../../common/clean-object");
const { AccrualPeriod } = require("./enum/accrual-period-enum");
const { ConflictError } = require("../../../middleware/error");

module.exports = (sequelize, DataTypes) => {
  class LeaveType extends Model {
    static leave_balances;
    static leave_requests;

    static associate(models) {
      this.leave_balances = LeaveType.hasMany(models.leave_balance, {
        foreignKey: "leave_type_id",
        as: "leave_balances",
      });
      this.leave_requests = LeaveType.hasMany(models.leave_request, {
        foreignKey: "leave_type_id",
        as: "leave_requests",
      });
    }

    getApplicableFor() {
      return this.getDataValue("applicable_for");
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
        set(value) {
          this.setDataValue("code", value?.trim()?.toUpperCase());
        },
        unique: {
          name: "unique_index",
          msg: "Organization with Code already exists",
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
      applicable_for: {
        type: DataTypes.JSONB,
        allowNull: true,
        set(value) {
          if (!value) return;
          if (typeof value !== "object" || Array.isArray(value))
            throw new Error("Applicable for should be a object.");
          this.setDataValue(
            "applicable_for",
            cleanObject(value, ["type", "value"])
          );
        },
        validate: {
          validateApplicableFor(value) {
            if (!value) return;

            if (!value.type)
              throw new Error("Applicable for type is required.");
            else if (!["role", "employee"].includes(value.type))
              throw new Error(
                "Applicable for type must be one of: role, employee."
              );

            if (!value.value)
              throw new Error("Applicable for value is required.");
            else if (value.value !== "all" && !Array.isArray(value.value))
              throw new Error(
                "Applicable for value should be an array of UUIDs or 'all'."
              );
            else if (value.value !== "all" && value.value.length === 0)
              throw new Error(
                "Applicable for value should have at least one UUID."
              );
            else if (
              value.value !== "all" &&
              value.value.some((uuid) => !isValidUUID(uuid))
            )
              throw new Error("Invalid UUID in Applicable for value.");
          },
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
            cleanObject(value, ["period", "applicable_on", "leave_count"])
          );
        },
        validate: {
          validateAccrual(value) {
            if (!value) return;

            if (!value.period) throw new Error("Accrual period is required.");
            else if (!AccrualPeriod.isValidValue(value.period))
              throw new Error(
                `Accrual period must be one of: ${AccrualPeriod.getValues().join(
                  ", "
                )}.`
              );

            if (!value.applicable_on)
              throw new Error("Accrual applicable on is required.");

            if (!value.leave_count)
              throw new Error("Accrual leave count is required.");
            else if (typeof value.leave_count !== "number")
              throw new Error("Accrual leave count should be a number.");
            else if (value.leave_count <= 0)
              throw new Error(
                "Accrual leave count should be gretaer than zero."
              );
          },
        },
      },
      min_waiting_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_attachment_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        type: DataTypes.JSONB,
        allowNull: true,
        set(value) {
          if (!value || typeof value !== "object" || Array.isArray(value)) {
            this.setDataValue("carry_forward", null);
            return;
          }

          if (value.is_allowed === false) {
            this.setDataValue("carry_forward", {
              is_allowed: false,
              max_limit: null,
              expiry_date: null,
            });
            return;
          }

          this.setDataValue("carry_forward", value);
        },
        validate: {
          validateCarryForward(value) {
            if (value == null) return;
            if (typeof value.is_allowed !== "boolean") {
              throw new Error("Is Allowed should be a boolean.");
            }

            if (value.is_allowed === true) {
              if (value.max_limit === undefined || value.max_limit === null) {
                throw new Error("Carry Forward max limit is required.");
              } else if (typeof value.max_limit !== "number") {
                throw new Error("Carry Forward max limit should be a number.");
              } else if (value.max_limit <= 0) {
                throw new Error(
                  "Carry Forward max limit should be greater than zero."
                );
              }

              if (!value.expiry_date) {
                throw new Error("Carry Forward expiry date is required.");
              } else if (!isValidDate(value.expiry_date)) {
                throw new Error("Invalid Carry Forward expiry date.");
              }
            }
          },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    }
  );

  return LeaveType;
};

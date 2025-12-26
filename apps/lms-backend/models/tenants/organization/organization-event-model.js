const { Model } = require("sequelize");
const { DayStatus } = require("./enum/day-status-enum");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {
  class OrganizationEvent extends Model {
    static organization;
    static attendances;

    static associate(models) {}

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        organization_id: undefined,
      };
    }
  }

  OrganizationEvent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "Organization Event uuid is required.",
          },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Event title is required.",
          },
          notNull: {
            msg: "Event title is required.",
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Start date must be a valid date.",
          },
          notNull: {
            msg: "Start date is required.",
          },
        },
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            msg: "End date must be a valid date.",
          },
          // isAfterStart(value) {
          //   if (
          //     this.start_date &&
          //     new Date(value) <= new Date(this.start_date)
          //   ) {
          //     throw new Error("End date must be after start date.");
          //   }
          // },
        },
      },
      day_status: {
        type: DataTypes.ENUM(DayStatus.getValues()),
        allowNull: false,
        defaultValue: DayStatus.ENUM.ACTIVE,
        validate: {
          isIn: {
            args: [DayStatus.getValues()],
            msg: `Day status must be one of: ${DayStatus.getValues().join(
              ", "
            )}`,
          },
          notNull: {
            msg: "Day status is required.",
          },
        },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: "organization_event",
    }
  );

  return OrganizationEvent;
};

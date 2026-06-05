const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {

  class Holiday extends Model {
    toJSON() {
      return {
        ...this.get(),
        id: undefined,
      };
    }
  }

  Holiday.init({
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
            throw new Error("Invalid UUID format.");
          }
        },
        notEmpty: {
          msg: "Holiday uuid is required.",
        },
        notNull: {
          msg: "Holiday uuid is required.",
        },
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Holiday name is required.",
        },
        notNull: {
          msg: "Holiday name is required.",
        },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Start date is required.",
        },
        notNull: {
          msg: "Start date is required.",
        },
        isDate: {
          msg: "Start date must be a valid date.",
        },
      },
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "End date is required.",
        },
        notNull: {
          msg: "End date is required.",
        },
        isDate: {
          msg: "End date must be a valid date.",
        },
      },
    },
  }, {
    sequelize,
    paranoid: true,
    timestamps: true,
    underscored: true,
    tableName: "holiday",
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  });

  return Holiday;
};

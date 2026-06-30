const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    static user;

    static associate(models) {
      this.user = Payroll.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Payroll.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      leave_balance_deficit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      attendance_penalty: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        validate: {
          notEmpty: {
            msg: "User id is required.",
          },
          notNull: {
            msg: "User id is required.",
          },
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "payroll",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Payroll;
};

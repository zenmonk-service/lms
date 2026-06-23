const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserLeaveType extends Model {
    static user;
    static leave_type;

    static associate(models) {
      this.user = UserLeaveType.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });

      this.leave_type = UserLeaveType.belongsTo(models.leave_type, {
        foreignKey: "leave_type_id",
        as: "leave_type",
      });
    }
  }

  UserLeaveType.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "leave_type",
          key: "id",
        },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: "user_leave_type",
    },
  );

  return UserLeaveType;
};
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RoleLeaveType extends Model {
    static role;
    static leave_type;

    static associate(models) {
      this.role = RoleLeaveType.belongsTo(models.role, {
        foreignKey: "role_id",
        as: "role",
      });

      this.leave_type = RoleLeaveType.belongsTo(models.leave_type, {
        foreignKey: "leave_type_id",
        as: "leave_type",
      });
    }
  }

  RoleLeaveType.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "role",
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
      tableName: "role_leave_type",
    },
  );

  return RoleLeaveType;
};
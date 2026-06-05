const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static user;

    static associate(models) {
      this.user = Notification.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      message: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Message is required.",
          },
          notNull: {
            msg: "Message is required.",
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
        validate: {
          notEmpty: {
            msg: "User id is required.",
          },
          notNull: {
            msg: "User id is required.",
          },
        },
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "notification",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Notification;
};

const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const bcrypt = require("bcrypt");
const { ConflictError } = require("../../../middleware/error");
const { PublicUserRole } = require("./public-user-role-enum");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static organizations;

    static associate(models) {
      this.organizations = User.belongsToMany(models.organization, {
        through: "organization_user",
      });
    }

    async matchPassword(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }

    updatePassword(password) {
      this.setDataValue("password", password);
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "User ID is required.",
          },
          notNull: {
            msg: "User ID is required.",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required.",
          },
          notNull: {
            msg: "Name is required.",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already exists.",
        },
        validate: {
          isEmail: {
            msg: "Invalid email format.",
          },
          notEmpty: {
            msg: "Email is required.",
          },
          notNull: {
            msg: "Email is required.",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required.",
          },
          notNull: {
            msg: "Password is required.",
          },
        },
      },
      role: {
        type: DataTypes.ENUM(PublicUserRole.getValues()),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Role is required.",
          },
          notEmpty: {
            msg: "Role is required.",
          },
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "user",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  User.addHook("beforeSave", async (user) => {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  return User;
};

const { Model } = require("sequelize");

/**
 * One table for team membership and reporting lines:
 *   (user, team, null)    → user is a member of team
 *   (user, team, manager) → within team, user reports to manager
 *   (user, null, manager) → user reports to manager outside any team
 */
module.exports = (sequelize, DataTypes) => {
  class UserTeam extends Model {
    static user;
    static team;
    static manager;

    static associate(models) {
      this.user = UserTeam.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
      this.team = UserTeam.belongsTo(models.team, {
        foreignKey: "team_id",
        as: "team",
      });
      this.manager = UserTeam.belongsTo(models.user, {
        foreignKey: "manager_id",
        as: "manager",
      });
    }
  }

  UserTeam.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "team",
          key: "id",
        },
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      underscored: true,
      tableName: "user_team",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return UserTeam;
};

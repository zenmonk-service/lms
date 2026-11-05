"use strict";

const TEAM_PERMISSIONS = [
  { action: "read", description: "Read teams" },
  { action: "create", description: "Create team" },
  { action: "update", description: "Update team and manage members" },
  { action: "delete", description: "Delete team" },
];

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "team",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.fn("uuid_generate_v4"),
          unique: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lead_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: "user", schema },
            key: "id",
          },
          onDelete: "SET NULL",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        deletedAt: {
          type: DataTypes.DATE,
          field: "deleted_at",
        },
      },
      { schema },
    );

    // Team names are unique (case-insensitive) among non-deleted teams.
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "team_name_unique" ON "${schema}"."team" (LOWER("name")) WHERE "deleted_at" IS NULL;`,
    );

    // user_team holds both team membership and reporting lines:
    //   (user, team, null)    → user is a member of team
    //   (user, team, manager) → within team, user reports to manager
    //   (user, null, manager) → user reports to manager outside any team
    // A user can have any number of managers. Membership rows always exist on their
    // own; a team line never replaces one. The service keeps team lines between
    // members of that team and the graph free of cycles.
    await queryInterface.createTable(
      "user_team",
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
            model: { tableName: "user", schema },
            key: "id",
          },
          onDelete: "CASCADE",
        },
        team_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: "team", schema },
            key: "id",
          },
          onDelete: "CASCADE",
        },
        manager_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: "user", schema },
            key: "id",
          },
          onDelete: "CASCADE",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
      },
      { schema },
    );

    // NULLS NOT DISTINCT so two identical rows with a null team or manager still clash.
    await queryInterface.sequelize.query(
      `ALTER TABLE "${schema}"."user_team"
         ADD CONSTRAINT "user_team_unique" UNIQUE NULLS NOT DISTINCT ("user_id", "team_id", "manager_id"),
         ADD CONSTRAINT "user_team_team_or_manager" CHECK ("team_id" IS NOT NULL OR "manager_id" IS NOT NULL),
         ADD CONSTRAINT "user_team_not_self" CHECK ("manager_id" IS NULL OR "manager_id" <> "user_id");`,
    );
    await queryInterface.addIndex(
      { tableName: "user_team", schema },
      ["team_id"],
      { name: "user_team_team_id_idx" },
    );
    await queryInterface.addIndex(
      { tableName: "user_team", schema },
      ["manager_id"],
      { name: "user_team_manager_id_idx" },
    );

    // Reporting lines live in user_team now, replacing the single user.parent_id.
    await queryInterface.sequelize.query(
      `ALTER TABLE "${schema}"."user" DROP COLUMN IF EXISTS "parent_id";`,
    );

    // New tenants already get 'team_management' in the enum (and the permission rows
    // from the seeder). Existing tenants need the enum value and the rows added here.
    await queryInterface.sequelize.query(
      `ALTER TYPE "${schema}"."enum_permission_tag" ADD VALUE IF NOT EXISTS 'team_management';`,
    );

    const [[{ count }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS count FROM "${schema}"."permission";`,
    );
    if (count === 0) return; // Fresh tenant: the seeder runs next and inserts them.

    for (const { action, description } of TEAM_PERMISSIONS) {
      await queryInterface.sequelize.query(
        `INSERT INTO "${schema}"."permission" (name, action, description, tag)
         SELECT 'Team Management', :action, :description, 'team_management'
         WHERE NOT EXISTS (
           SELECT 1 FROM "${schema}"."permission"
           WHERE tag = 'team_management' AND action = :action
         );`,
        { replacements: { action, description } },
      );
    }

    await queryInterface.sequelize.query(
      `INSERT INTO "${schema}"."role_permission" (role_id, permission_id)
       SELECT r.id, p.id
       FROM "${schema}"."role" r
       CROSS JOIN "${schema}"."permission" p
       WHERE r.code = 'ADMIN' AND p.tag = 'team_management'
       ON CONFLICT DO NOTHING;`,
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.sequelize.query(
      `DELETE FROM "${schema}"."role_permission"
       WHERE permission_id IN (SELECT id FROM "${schema}"."permission" WHERE tag = 'team_management');`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM "${schema}"."permission" WHERE tag = 'team_management';`,
    );
    // Postgres cannot drop a single enum value; 'team_management' stays in the type.
    await queryInterface.sequelize.query(
      `ALTER TABLE "${schema}"."user" ADD COLUMN IF NOT EXISTS "parent_id" INTEGER
         REFERENCES "${schema}"."user" ("id");`,
    );
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "${schema}"."user_team";`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "${schema}"."team";`);
  },
};

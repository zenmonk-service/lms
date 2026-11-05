const { Op, Sequelize } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");

const USER_SUMMARY_ATTRIBUTES = [
  "id",
  "user_id",
  "name",
  "email",
  "emp_code",
  "image",
  "is_active",
];

class TeamRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.team,
    });
  }

  _leadInclude() {
    return {
      model: this.tenant(db.tenants.user),
      as: "lead",
      attributes: USER_SUMMARY_ATTRIBUTES,
      required: false,
    };
  }

  _memberCountAttribute() {
    return [
      Sequelize.literal(`(
        SELECT COUNT(*)::int
        FROM "${this.schema}"."user_team" ut
        JOIN "${this.schema}"."user" u ON u.id = ut.user_id AND u.deleted_at IS NULL
        WHERE ut.team_id = "Team"."id" AND ut.manager_id IS NULL
      )`),
      "member_count",
    ];
  }

  /** Members as `[{ user_id, name, is_lead }]`, lead first then by name (for list previews). */
  _memberPreviewAttribute() {
    return [
      Sequelize.literal(`(
        SELECT COALESCE(
          json_agg(
            json_build_object('user_id', u.user_id, 'name', u.name, 'is_lead', u.id = "Team"."lead_id")
            ORDER BY (u.id = "Team"."lead_id") DESC, u.name
          ),
          '[]'::json
        )
        FROM "${this.schema}"."user_team" ut
        JOIN "${this.schema}"."user" u ON u.id = ut.user_id AND u.deleted_at IS NULL
        WHERE ut.team_id = "Team"."id" AND ut.manager_id IS NULL
      )`),
      "member_preview",
    ];
  }

  async findByNameInsensitive(name, transaction) {
    return this.findOne(
      Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("name")),
        String(name).trim().toLowerCase(),
      ),
      [],
      true,
      undefined,
      transaction,
    );
  }

  async listTeams({ search, page: pageOption, limit: limitOption }) {
    const criteria = {};
    if (search) {
      criteria.name = { [Op.iLike]: `%${search}%` };
    }

    const { offset, limit, page } = new Paginator(pageOption, limitOption);

    const { rows, count } = await this.findAndCountAll(
      criteria,
      [this._leadInclude()],
      offset,
      limit,
      [
        ["name", "ASC"],
        ["id", "ASC"],
      ],
      true,
      { include: [this._memberCountAttribute(), this._memberPreviewAttribute()] },
    );

    return {
      rows,
      count,
      current_page: page + 1,
      per_page: limit,
      total: await this.count(),
    };
  }

  async listAllTeams({ search }) {
    const criteria = {};
    if (search) {
      criteria.name = { [Op.iLike]: `%${search}%` };
    }
    return this.findAll(criteria, [this._leadInclude()], true, undefined, undefined, {
      order: [
        ["name", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  async getTeamDetail(teamUuid, transaction) {
    return this.findOne(
      { uuid: { [Op.eq]: teamUuid } },
      [
        this._leadInclude(),
        {
          model: this.tenant(db.tenants.user),
          as: "members",
          attributes: USER_SUMMARY_ATTRIBUTES,
          through: { model: this.tenant(db.tenants.user_team), attributes: [] },
          required: false,
          include: [
            {
              model: this.tenant(db.tenants.role),
              as: "role",
              attributes: ["uuid", "name"],
            },
          ],
        },
      ],
      true,
      { include: [this._memberCountAttribute()] },
      transaction,
    );
  }
}

module.exports = {
  teamRepository: new TeamRepository({
    sequelize: db.sequelize,
  }),
  USER_SUMMARY_ATTRIBUTES,
};

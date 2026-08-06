const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { BadRequestError } = require("../middleware/error");

class AttachmentRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.attachment,
    });
  }
}

module.exports = {
  attachmentRepository: new AttachmentRepository({
    sequelize: db.sequelize,
  }),
};

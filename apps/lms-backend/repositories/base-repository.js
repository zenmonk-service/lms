const { DataTypes } = require("sequelize");
const { getSchema } = require("../lib/schema");

exports.BaseRepository = class BaseRepository {
  constructor({ sequelize, modelFactory }) {
    this.sequelize = sequelize;
    this._modelFactory = modelFactory; // just a function reference
  }
  //    `(SELECT id FROM "${model}" WHERE ${key} = '${uuid}')`

  // ✅ every time you access `this.model`, it *calls* the factory function
  get model() {
    const model = this._modelFactory();
    if (!model) {
      throw new Error(
        "Model factory returned undefined. Check db.tenants.user and getSchema()."
      );
    }
    return model;
  }
  /**
   * Returns a literal string for a model and ID.
   */
  getLiteralFrom(model, uuid, key = "uuid") {
    return this.sequelize.literal(
      `(SELECT id FROM "${getSchema()}"."${model}" WHERE ${key} = '${uuid}')`
    );
  }

  /**
   * Returns a valid order column filtering.
   * @param {string} modelName - The model name.
   * @param {string} orderColumn - The column name.
   * @param {string} orderType - The order type.
   * @param {string} orderColumnType - The column type.
   * @returns {array} - Returns a valid order column filtering.
   */
  customSorting(modelName, orderColumn, orderType, orderColumnType) {
    if (!orderColumn) return [];
    if (
      orderColumnType === DataTypes.STRING.key ||
      orderColumnType === DataTypes.TEXT.key
    ) {
      return [
        [
          this.sequelize.fn(
            "lower",
            this.sequelize.col(`${modelName}.${orderColumn}`)
          ),
          orderType,
        ],
      ];
    } else {
      return [[orderColumn, orderType]];
    }
  }

  async count(criteria, options) {
    return this.model.count({ where: criteria, ...options });
  }

  build(payload, options) {
    return this.model.build(payload, options);
  }

  /**
   * The create method create database entries.
   * @param {object} payload - To define which attributes can be set in the create method.
   * @param {object} options - If you really want to let the query restrict the model data.
   */
  async create(payload, options) {
    return this.model.create(payload, options);
  }

  /**
   * The create method create database entries.
   * @param {object} payload - To define which attributes can be set in the create method.
   * @param {object} options - If you really want to let the query restrict the model data.
   */
  async bulkCreate(payload, options = {}) {
    options.validate = true;
    return this.model.bulkCreate(payload, options);
  }

  /**
   * The upsert method insert or update database entries.
   * @param {object} criteria - To upsert records with criteria.
   * @param {object} payload - To upsert which attributes can be set in this method.
   * @param {object} options - If you really want to let the query restrict the model data.
   */
  async upsert(criteria, payload, options) {
    return this.model.upsert(payload, {
      where: criteria,
      ...options,
    });
  }

  /**
   * The update method update database entries.
   * @param {object} criteria - To update records with criteria.
   * @param {object} payload - To update which attributes can be set in this method.
   * @param {array} include - To update records with association.
   * @param {object} transaction - To update with transaction.
   * @param {array} returning - To return columns after destroy.
   */
  async update(
    criteria,
    payload,
    include,
    transaction,
    returning = ["*"],
    paranoid = true
  ) {
    return this.model.update(payload, {
      where: criteria,
      include,
      transaction,
      returning,
      paranoid,
    });
  }

  /**
   * The findOrCreate method find or create database entries.
   * @param {object} criteria - To find or create records with criteria.
   * @param {object} payload - To create which attributes can be set in this method.
   * @param {array} include - To find or create records with association.
   * @param {object} transaction - To find or create with transaction.
   * @param {array} returning - To return columns after destroy.
   * @returns {object} - Returns an array with the instance and a boolean indicating whether it was created or not.
   */
  async findOrCreate(
    criteria,
    payload,
    include=[],
    transaction,
    returning = ["*"]
  ) {
    return this.model.findOrCreate({
      where: criteria,
      defaults: payload,
      include,
      transaction,
      returning,
    });
  }
  /**
   * The findByPk method obtains only a single entry from the table, using the provided primary key.
   * @param {number} primaryKey - To find records with primary key.
   * @param {boolean} paranoid - If you really want to let the query see the soft-deleted records, you can pass the paranoid: false option to the query method
   */
  async findByPk(primaryKey, paranoid = true) {
    return this.model.findByPk(primaryKey, paranoid);
  }

  /**
   * The findOne method obtains the first entry it finds.
   * @param {object} criteria - To find records with criteria.
   * @param {array} include - To find records with association.
   * @param {boolean} paranoid - If you really want to let the query see the soft-deleted records, you can pass the paranoid: false option to the query method
   * @param {object} attributes - To exclude or include column in records.
   */
  async findOne(
    criteria,
    include = [],
    paranoid = true,
    attributes,
    transaction,
    options
  ) {
    return this.model.findOne({
      where: criteria,
      include: include,
      paranoid,
      attributes,
      transaction,
      ...options,
    });
  }

  /**
   * The findAll method generates a standard SELECT query which will retrieve all entries from the table
   * @param {object} criteria - To find records with criteria.
   * @param {array} include - To find records with association.
   * @param {boolean} paranoid - If you really want to let the query see the soft-deleted records, you can pass the paranoid: false option to the query method
   * @param {object} attributes - To exclude or include column in records.
   */
  async findAll(
    criteria,
    include = [],
    paranoid = true,
    attributes,
    transaction,
    options = {}
  ) {
    return this.model.findAll({
      where: criteria,
      include: include,
      paranoid,
      transaction,
      attributes,
      ...options,
    });
  }

  /**
   * The sum method generates a standard SELECT query which will sum the specified attribute for all matching entries
   * @param {object} criteria - To find records with criteria.
   * @param {string} field - The field or attribute to sum.
   * @param {array} include - To find records with association.
   * @param {boolean} paranoid - If you really want to let the query see the soft-deleted records, you can pass the paranoid: false option to the query method
   */
  async sum(
    criteria,
    field,
    include = [],
    paranoid = true,
    transaction,
    options = {}
  ) {
    return this.model.sum(field, {
      where: criteria,
      include: include,
      paranoid,
      transaction,
      ...options,
    });
  }

  /**
   * The findAndCountAll method generates a standard SELECT query which will retrieve all entries from the table with total count
   * @param {object} criteria - To find records with criteria.
   * @param {array} include - To find records with association.
   * @param {number} [offset=0] - To skip 0 instances/rows
   * @param {number} [limit=10] - To fetch 10 instances/rows
   * @param {array[column, direction]} order - Will return `updated_at` DESC
   * @param {boolean} paranoid - If you really want to let the query see the soft-deleted records, you can pass the paranoid: false option to the query method
   * @param {object} attributes - To exclude or include column in records.
   */
  async findAndCountAll(
    criteria,
    include = [],
    offset = 0,
    limit = 10,
    order,
    paranoid = true,
    attributes,
    transaction,
    options = {}
  ) {
    return this.model.findAndCountAll({
      where: criteria,
      include: include,
      offset,
      limit,
      order,
      paranoid,
      transaction,
      distinct: true,
      attributes,
      ...options,
    });
  }

  /**
   * To restore soft-deleted records, you can use the restore method
   * @param {object} criteria - To restore records with criteria.
   * @param {object} transaction - To update with transaction.
   * @param {array} returning - To return columns after destroy.
   */
  async restore(criteria, transaction, returning = ["*"]) {
    return this.model.restore({ where: criteria, transaction, returning });
  }

  /**
   * When you call the destroy method, a soft-deletion will happen:
   * @param {object} criteria - To destroy records with criteria.
   * @param {boolean} force - If you really want a hard-deletion and your model is paranoid, you can force it using the force: true option:
   * @param {array} include - To destroy records with association.
   * @param {object} transaction - To update with transaction.
   * @param {array} returning - To return columns after destroy.
   */
  async destroy(
    criteria,
    force = false,
    include,
    transaction,
    returning = ["*"]
  ) {
    return this.model.destroy({
      where: criteria,
      force,
      include,
      transaction,
      returning,
    });
  }

  /**
   * To get all the columns of the model
   */
  async allColumnsName() {
    return this.model.getAttributes();
  }
};

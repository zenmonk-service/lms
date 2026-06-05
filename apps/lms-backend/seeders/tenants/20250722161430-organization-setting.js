"use strict";

const theme = { name: "Summer", value: "theme-summer", base: "#f66e60" };

module.exports = {
  async up(queryInterface, Sequelize, schema) {
    await queryInterface.bulkInsert(
      { tableName: "organization_setting", schema },
      [
        {
          theme: JSON.stringify(theme),
          attendance_method: "manual",
          work_days: JSON.stringify([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
          ]),
          start_time: "09:00:00",
          end_time: "18:00:00",
          employee_id_pattern_type: "alpha_numeric",
          employee_id_pattern_value: "EMP-{YYYY}{MM}{DD}-{####}",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.bulkDelete(
      { tableName: "organization_setting", schema },
      {}
    );
  },
};

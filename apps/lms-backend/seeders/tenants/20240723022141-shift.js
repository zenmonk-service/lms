"use strict";

const shifts = [
  {
    uuid: "e3b1c6d4-5f27-4e1a-8b3c-9d0f12345678",
    name: "Day Shift",
    start_time: "09:00:00",
    end_time: "17:00:00",
    effective_hours: 8.0,
  },
  {
    uuid: "f2c3d4e5-6a78-4f2b-9a4d-0b1c23456789",
    name: "Night Shift",
    start_time: "21:00:00",
    end_time: "05:00:00",
    effective_hours: 8.0,
  },
  {
    uuid: "a1d2e3f4-7b89-4a3c-8a5e-1c2d34567890",
    name: "Evening Shift",
    start_time: "13:00:00",
    end_time: "21:00:00",
    effective_hours: 8.0,
  },
  
];

module.exports = {
  async up(queryInterface, Sequelize, schema) {
    await queryInterface.bulkInsert({ tableName: "organization_shift", schema }, shifts);
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.bulkDelete(
      { tableName: "organization_shift", schema },
      { uuid: shifts.map((r) => r.uuid) }
    );
  },
};

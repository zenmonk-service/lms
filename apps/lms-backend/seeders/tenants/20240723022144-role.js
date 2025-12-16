"use strict";

const roles = [
  {
    uuid: "a3b1c6d4-5f27-4e1a-8b3c-9d0f12345678",
    name: "Admin",
    description: "Full system access including org-wide configuration and user/role management.",
    role_level: 1,
  },
  {
    uuid: "b2c3d4e5-6a78-4f2b-9a4d-0b1c23456789",
    name: "Chief Technology Officer (CTO)",
    description: "Oversees technical strategy, architecture decisions and engineering organisation.",
    role_level: 2,
  },
  {
    uuid: "c1d2e3f4-7b89-4a3c-8a5e-1c2d34567890",
    name: "HR Manager",
    description: "Manages employee lifecycle, policies, onboarding and HR workflows.",
    role_level: 3,
  },
  {
    uuid: "d4e5f6a7-8c90-4b4d-9b6f-2d3e45678901",
    name: "Finance Manager",
    description: "Responsible for billing, payroll, budgets and financial approvals.",
    role_level: 3,
  },
  {
    uuid: "e5f6a7b8-9d01-4c5e-8c7a-3e4f56789012",
    name: "Engineering Manager",
    description: "Leads engineering teams, handles planning, delivery and people management.",
    role_level: 4,
  },
  {
    uuid: "f6a7b8c9-0e12-4d6f-9d8b-4f5067890123",
    name: "Team Lead",
    description: "Technical lead for a team; assigns tasks, mentors and reviews code.",
    role_level: 5,
  },
  {
    uuid: "07a8b9c0-1f23-4e70-8e9c-506178901234",
    name: "Software Engineer",
    description: "Implements features, fixes bugs and contributes to the codebase.",
    role_level: 6,
  },
  {
    uuid: "18b9c0d1-2a34-4f81-9fab-617289012345",
    name: "Contractor",
    description: "Short-term contributor with limited system access for contracted work.",
    role_level: 7,
  },
];

module.exports = {
  async up(queryInterface, Sequelize, schema) {
    await queryInterface.bulkInsert({ tableName: "role", schema }, roles);
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.bulkDelete(
      { tableName: "role", schema },
      { uuid: roles.map((r) => r.uuid) }
    );
  },
};

"use strict";

const { Action } = require("../../models/common/action-enum");
const { Permission } = require("../../models/common/permission-enum");

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    const permissionRecords = [
      // ------------------ User Management ------------------
      {
        name: "User Management",
        description: "Read users",
        action: Action.ENUM.READ,
        tag: Permission.ENUM.USER_MANAGEMENT,
      },
      {
        name: "User Management",
        description: "Create users",
        action: Action.ENUM.CREATE,
        tag: Permission.ENUM.USER_MANAGEMENT,
      },
      {
        name: "User Management",
        description: "Update users",
        action: Action.ENUM.UPDATE,
        tag: Permission.ENUM.USER_MANAGEMENT,
      },
      {
        name: "User Management",
        description: "Activate users",
        action: Action.ENUM.ACTIVATE,
        tag: Permission.ENUM.USER_MANAGEMENT,
      },

      // ------------------ User Attendance Management ------------------
      // {
      //   name: "User Attendance Management",
      //   description: "Read attendance records",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.USER_ATTENDANCE_MANAGEMENT,
      // },
      // {
      //   name: "User Attendance Management",
      //   description: "Check in",
      //   action: Action.ENUM.CHECK_IN,
      //   tag: Permission.ENUM.USER_ATTENDANCE_MANAGEMENT,
      // },
      // {
      //   name: "User Attendance Management",
      //   description: "Check out",
      //   action: Action.ENUM.CHECK_OUT,
      //   tag: Permission.ENUM.USER_ATTENDANCE_MANAGEMENT,
      // },
      // {
      //   name: "User Attendance Management",
      //   description: "Generate attendance reports",
      //   action: Action.ENUM.REPORT,
      //   tag: Permission.ENUM.USER_ATTENDANCE_MANAGEMENT,
      // },

      // ------------------ Organization Management ------------------
      // {
      //   name: "Organization Management",
      //   description: "Update organization",
      //   action: Action.ENUM.UPDATE,
      //   tag: Permission.ENUM.ORGANIZATION_MANAGEMENT,
      // },

      // ------------------ Organization Holiday Management ------------------
      // {
      //   name: "Organization Holiday Management",
      //   description: "Read holidays",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Organization Holiday Management",
      //   description: "Create holiday",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Organization Holiday Management",
      //   description: "Create holidays in bulk",
      //   action: Action.ENUM.CREATE_BULK,
      //   tag: Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Organization Holiday Management",
      //   description: "Activate holiday",
      //   action: Action.ENUM.ACTIVATE,
      //   tag: Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Organization Holiday Management",
      //   description: "Deactivate holiday",
      //   action: Action.ENUM.DEACTIVATE,
      //   tag: Permission.ENUM.ORGANIZATION_HOLIDAY_MANAGEMENT,
      // },

      // ------------------ Role Management ------------------
      {
        name: "Role Management",
        description: "Read roles",
        action: Action.ENUM.READ,
        tag: Permission.ENUM.ROLE_MANAGEMENT,
      },
      {
        name: "Role Management",
        description: "Create role",
        action: Action.ENUM.CREATE,
        tag: Permission.ENUM.ROLE_MANAGEMENT,
      },
      {
        name: "Role Management",
        description: "Update role",
        action: Action.ENUM.UPDATE,
        tag: Permission.ENUM.ROLE_MANAGEMENT,
      },
      // ------------------ Leave Type Management ------------------
      {
        name: "Leave Type Management",
        description: "Read organization leaves",
        action: Action.ENUM.READ,
        tag: Permission.ENUM.LEAVE_TYPE_MANAGEMENT,
      },
      {
        name: "Leave Type Management",
        description: "Create organization leave",
        action: Action.ENUM.CREATE,
        tag: Permission.ENUM.LEAVE_TYPE_MANAGEMENT,
      },
      {
        name: "Leave Type Management",
        description: "Update organization leave",
        action: Action.ENUM.UPDATE,
        tag: Permission.ENUM.LEAVE_TYPE_MANAGEMENT,
      },
      // {
      //   name: "Leave Type Management",
      //   description: "Generate leave reports",
      //   action: Action.ENUM.REPORT,
      //   tag: Permission.ENUM.LEAVE_TYPE_MANAGEMENT,
      // },

      // ------------------ Organization User Management ------------------
      // {
      //   name: "Organization User Management",
      //   description: "Read organization users",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.ORGANIZATION_USER_MANAGEMENT,
      // },
      // {
      //   name: "Organization User Management",
      //   description: "Create organization user",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.ORGANIZATION_USER_MANAGEMENT,
      // },
      // {
      //   name: "Organization User Management",
      //   description: "Update organization user",
      //   action: Action.ENUM.UPDATE,
      //   tag: Permission.ENUM.ORGANIZATION_USER_MANAGEMENT,
      // },

      // ------------------ Leave Request Management ------------------
      {
        name: "Leave Request Management",
        description: "Read leave requests",
        action: Action.ENUM.READ,
        tag: Permission.ENUM.LEAVE_REQUEST_MANAGEMENT,
      },
      {
        name: "Leave Request Management",
        description: "Create leave requests",
        action: Action.ENUM.CREATE,
        tag: Permission.ENUM.LEAVE_REQUEST_MANAGEMENT,
      },
      {
        name: "Leave Request Management",
        description: "Update leave requests",
        action: Action.ENUM.UPDATE,
        tag: Permission.ENUM.LEAVE_REQUEST_MANAGEMENT,
      },
      {
        name: "Leave Request Management",
        description: "Approve/Reject/Recommend leave requests",
        action: Action.ENUM.APPROVE,
        tag: Permission.ENUM.LEAVE_REQUEST_MANAGEMENT,
      },

      // ------------------ Holiday Management ------------------
      // {
      //   name: "Holiday Management",
      //   description: "Read holidays",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Holiday Management",
      //   description: "Create holiday",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Holiday Management",
      //   description: "Update holiday",
      //   action: Action.ENUM.UPDATE,
      //   tag: Permission.ENUM.HOLIDAY_MANAGEMENT,
      // },
      // {
      //   name: "Holiday Management",
      //   description: "Create holidays in bulk",
      //   action: Action.ENUM.CREATE_BULK,
      //   tag: Permission.ENUM.HOLIDAY_MANAGEMENT,
      // },

      // ------------------ Role Management ------------------
      // {
      //   name: "Role Management",
      //   description: "Read roles",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.ROLE_MANAGEMENT,
      // },
      // {
      //   name: "Role Management",
      //   description: "Create role",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.ROLE_MANAGEMENT,
      // },
      // {
      //   name: "Role Management",
      //   description: "Update role",
      //   action: Action.ENUM.UPDATE,
      //   tag: Permission.ENUM.ROLE_MANAGEMENT,
      // },

      // ------------------ Department Management ------------------
      // {
      //   name: "Department Management",
      //   description: "Read departments",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.DEPARTMENT_MANAGEMENT,
      // },
      // {
      //   name: "Department Management",
      //   description: "Create department",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.DEPARTMENT_MANAGEMENT,
      // },
      // {
      //   name: "Department Management",
      //   description: "Update department",
      //   action: Action.ENUM.UPDATE,
      //   tag: Permission.ENUM.DEPARTMENT_MANAGEMENT,
      // },
      // {
      //   name: "Department Management",
      //   description: "Activate department",
      //   action: Action.ENUM.ACTIVATE,
      //   tag: Permission.ENUM.DEPARTMENT_MANAGEMENT,
      // },
      // {
      //   name: "Department Management",
      //   description: "Deactivate department",
      //   action: Action.ENUM.DEACTIVATE,
      //   tag: Permission.ENUM.DEPARTMENT_MANAGEMENT,
      // },

      // ------------------ Attendance Management ------------------
      // {
      //   name: "Attendance Management",
      //   description: "Read attendance",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.ATTENDANCE_MANAGEMENT,
      // },
      // {
      //   name: "Attendance Management",
      //   description: "Create attendance",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.ATTENDANCE_MANAGEMENT,
      // },
      // {
      //   name: "Attendance Management",
      //   description: "Create attendance in bulk",
      //   action: Action.ENUM.CREATE_BULK,
      //   tag: Permission.ENUM.ATTENDANCE_MANAGEMENT,
      // },

      // ------------------ Organization Event Management ------------------
      // {
      //   name: "Organization Event Management",
      //   description: "Read events",
      //   action: Action.ENUM.READ,
      //   tag: Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT,
      // },
      // {
      //   name: "Organization Event Management",
      //   description: "Create event",
      //   action: Action.ENUM.CREATE,
      //   tag: Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT,
      // },
      // {
      //   name: "Organization Event Management",
      //   description: "Update event",
      //   action: Action.ENUM.UPDATE,
      //   tag: Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT,
      // },
      // {
      //   name: "Organization Event Management",
      //   description: "Delete event",
      //   action: Action.ENUM.DELETE,
      //   tag: Permission.ENUM.ORGANIZATION_EVENT_MANAGEMENT,
      // },
    ];

    await queryInterface.bulkInsert(
      { tableName: "permission", schema },
      permissionRecords
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        { tableName: "permission", schema },
        null,
        { transaction }
      );
    });
  },
};

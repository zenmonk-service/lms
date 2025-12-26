"use strict";

const theme = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.129 0.042 264.695)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.129 0.042 264.695)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.129 0.042 264.695)",
  "--primary": "oklch(0.208 0.042 265.755)",
  "--primary-foreground": "oklch(0.984 0.003 247.858)",
  "--secondary": "oklch(0.968 0.007 247.896)",
  "--secondary-foreground": "oklch(0.208 0.042 265.755)",
  "--muted": "oklch(0.968 0.007 247.896)",
  "--muted-foreground": "oklch(0.554 0.046 257.417)",
  "--accent": "oklch(0.968 0.007 247.896)",
  "--accent-foreground": "oklch(0.208 0.042 265.755)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--border": "oklch(0.929 0.013 255.508)",
  "--input": "oklch(0.929 0.013 255.508)",
  "--ring": "oklch(0.704 0.04 256.788)",
  "--chart-1": "oklch(0.646 0.222 41.116)",
  "--chart-2": "oklch(0.6 0.118 184.704)",
  "--chart-3": "oklch(0.398 0.07 227.392)",
  "--chart-4": "oklch(0.828 0.189 84.429)",
  "--chart-5": "oklch(0.769 0.188 70.08)",
  "--sidebar": "hsl(0 0% 98%)",
  "--sidebar-foreground": "hsl(240 5.3% 26.1%)",
  "--sidebar-primary": "hsl(240 5.9% 10%)",
  "--sidebar-primary-foreground": "hsl(0 0% 98%)",
  "--sidebar-accent": "hsl(240 4.8% 95.9%)",
  "--sidebar-accent-foreground": "hsl(240 5.9% 10%)",
  "--sidebar-border": "hsl(220 13% 91%)",
  "--sidebar-ring": "hsl(217.2 91.2% 59.8%)",
  "--radius": "0.625rem",
};

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

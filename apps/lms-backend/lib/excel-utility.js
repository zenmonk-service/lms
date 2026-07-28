const XLSX = require("xlsx");
const { DownloadExcel } = require("../services/enum/download-excel.enum");
const ExcelJS = require("exceljs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

class ExcelUtility {
  static readFile(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });
  }

  static async writeFile(type, data, options = {}) {
    const workbook = XLSX.utils.book_new();

    let worksheet;

    switch (type) {
      case DownloadExcel.ENUM.DAILY_ATTENDANCE:
        worksheet = this.generateDailyAttendanceSheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        break;
      case DownloadExcel.ENUM.MONTHLY_ATTENDANCE:
        worksheet = this.generateMonthlyAttendanceSheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        break;
      case DownloadExcel.ENUM.MONTHLY_PAYROLL:
        worksheet = this.generateMonthlyPayrollSheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        break;
      case DownloadExcel.ENUM.DAILY_ATTENDANCE_ANALYTICS:
        return this.generateDailyAttendancePieChart(data);
      case DownloadExcel.ENUM.MONTHLY_ATTENDANCE_ANALYTICS:
        return this.generateMonthlyAttendanceBarChart(data);
      default:
        throw new Error(`Unsupported excel export type: ${type}`);
    }

    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
  }

  static generateDailyAttendanceSheet(usersData) {
    const attendanceDate =
      usersData.find((user) => user.attendances?.length)?.attendances[0]
        ?.date || "";

    const rows = [
      [`Attendance Report - ${attendanceDate}`],
      [],
      ["Employee", "Check In", "Check Out", "Status", "Employee Code"],
    ];

    usersData.forEach((user) => {
      const attendance = user.attendances?.[0];

      rows.push([
        user.name,
        attendance?.check_in || "-",
        attendance?.check_out || "-",
        attendance?.status || "Absent",
        user.emp_code || user.user_id,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 4 },
      },
    ];

    ws["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
    ];

    return ws;
  }

  static generateMonthlyAttendanceSheet(usersData) {
    const users = {};
    const dates = new Set();

    usersData.forEach((user) => {
      const id = user.user_id;

      users[id] = {
        name: user.name,
        employeeCode: user.emp_code || user.user_id,
        attendance: {},
      };

      (user.attendances || []).forEach((attendance) => {
        users[id].attendance[attendance.date] = attendance;
        dates.add(attendance.date);
      });
    });

    const sortedDates = [...dates].sort();

    const rows = [];
    const merges = [];

    rows.push(["Employee (Emp Code)", "Field", ...sortedDates]);

    let currentRow = 1;

    Object.values(users).forEach((user) => {
      const fields = ["Check In", "Check Out", "Status", "Affected Hours"];

      fields.forEach((field, index) => {
        const row = [];

        row.push(index === 0 ? `${user.name} (${user.employeeCode})` : "");
        row.push(field);

        sortedDates.forEach((date) => {
          const attendance = user.attendance[date];

          switch (field) {
            case "Check In":
              row.push(attendance?.check_in || "-");
              break;

            case "Check Out":
              row.push(attendance?.check_out || "-");
              break;

            case "Status":
              row.push(attendance?.status || "-");
              break;

            case "Affected Hours":
              row.push(attendance?.affected_hours || "-");
              break;
          }
        });

        rows.push(row);
      });

      merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow + fields.length - 1, c: 0 },
      });

      rows.push([]);
      currentRow += fields.length + 1;
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!merges"] = merges;

    ws["!cols"] = [
      { wch: 35 },
      { wch: 18 },
      ...sortedDates.map(() => ({ wch: 15 })),
    ];

    return ws;
  }
  static generateMonthlyPayrollSheet(payload) {
    const period = payload[0]?.period || "";

    const rows = [
      [`Payroll for Month - ${period}`],
      [],
      [
        "Employee",
        "Leave Balance Deficit",
        "Attendance Penalty",
        "",
        "",
        "Total Penalty",
      ],
      ["", "", "Late", "Absent", "Early Departure", ""],
    ];

    payload.forEach((record) => {
      const user = record.user || {};
      const penalty = record.attendance_penalty || {};

      const late = Number(penalty.late) || 0;
      const absent = Number(penalty.absent) || 0;
      const earlyDeparture = Number(penalty.early_departure) || 0;
      const leaveBalanceDeficit = Number(record.leave_balance_deficit) || 0;

      const totalPenalty = leaveBalanceDeficit + late + absent + earlyDeparture;

      rows.push([
        `${user.name} (${user.emp_code})`,
        leaveBalanceDeficit,
        late,
        absent,
        earlyDeparture,
        totalPenalty,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } }, // Employee
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } }, // Leave Balance Deficit
      { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } }, // Attendance Penalty (spans Late/Absent/Early Departure)
      { s: { r: 2, c: 5 }, e: { r: 3, c: 5 } }, // Total Penalty
    ];

    ws["!cols"] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 15 },
    ];

    return ws;
  }
  static async generateDailyAttendancePieChart(report) {
    if (report?.toJSON) {
      report = report.toJSON();
    }
    const width = 900;
    const height = 600;

    const canvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: "white",
    });

    const configuration = {
      type: "pie",
      data: {
        labels: ["Present", "Absent", "On Leave", "Late"],
        datasets: [
          {
            data: [
              Number(report.present_count) || 0,
              Number(report.absent_count) || 0,
              Number(report.on_leave_count) || 0,
              Number(report.late_count) || 0,
            ],
            backgroundColor: ["#4CAF50", "#F44336", "#2196F3", "#FFC107"],
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Daily Attendance Analytics",
            font: {
              size: 22,
            },
          },
          legend: {
            position: "bottom",
          },
        },
      },
    };

    const image = await canvas.renderToBuffer(configuration);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Analytics");

    const imageId = workbook.addImage({
      buffer: image,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 800, height: 500 },
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  static async generateMonthlyAttendanceBarChart(report) {
    report = report.map((r) => r.toJSON());
    const width = 1200;
    const height = 700;

    const canvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: "white",
    });

    const configuration = {
      type: "bar",
      data: {
        labels: report.map((x) => x.month),
        datasets: [
          {
            label: "Present",
            backgroundColor: "#4CAF50",
            data: report.map((x) => Number(x.present_count)),
          },
          {
            label: "Absent",
            backgroundColor: "#F44336",
            data: report.map((x) => Number(x.absent_count)),
          },
          {
            label: "On Leave",
            backgroundColor: "#2196F3",
            data: report.map((x) => Number(x.on_leave_count)),
          },
          {
            label: "Late",
            backgroundColor: "#FFC107",
            data: report.map((x) => Number(x.late_count)),
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: "Monthly Attendance Analytics",
            font: {
              size: 22,
            },
          },
          legend: {
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    const image = await canvas.renderToBuffer(configuration);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Analytics");

    const imageId = workbook.addImage({
      buffer: image,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 950, height: 550 },
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}

module.exports = {
  ExcelUtility,
};

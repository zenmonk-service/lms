import { uploadAttendanceReportAction } from "@/features/attendances/upload-attendance/upload-attendance.action";
import {
  UploadAttendancePayload,
  UploadType,
} from "@/features/attendances/upload-attendance/upload-attendance.type";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FieldMappingDialog } from "../field-mapping-dialog";
import { toastError } from "@/shared/toast/toast-error";
import { IPendingStatusChange } from "../../payroll/components/attendance-reconciliation";

function readFile(buffer?: ArrayBuffer | null) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });
}
function convertTime(value: string) {
  if (!value || typeof value !== "number") {
    return null;
  }

  const totalSeconds = Math.round((value % 1) * 24 * 60 * 60);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );

  return `${hours}:${minutes}:00`;
}

interface IProps {
  index?: number;
  targetDate?: string;
  getUserAttendances?: () => void;
  onSuccess?: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setPendingStatusChange: React.Dispatch<React.SetStateAction<IPendingStatusChange | null>>;
}

export default function UploadAttendance({
  index,
  targetDate,
  getUserAttendances,
  onSuccess,
  fileInputRef,
  setPendingStatusChange,
}: IProps) {

  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(-1);
  const [reportDate, setReportDate] = useState<string | null>(null);
  const [headers, setHeaders] = useState<{ index: number; value: string }[]>([]);
  const [mapFields, setMapFields] = useState<Record<string, { index: number; value: string }>>({
    emp_code: { index: -1, value: "" },
    in_time: { index: -1, value: "" },
    out_time: { index: -1, value: "" },
  });

  const dispatch = useAppDispatch();
  const { uuid } = useAppSelector((state) => state.organizationsSlice.currentOrganization);

  const onUpload = async (data: UploadAttendancePayload) => {
    const result = await dispatch(uploadAttendanceReportAction(data));
    if (!uploadAttendanceReportAction.fulfilled.match(result)) {
      return;
    }
    getUserAttendances?.();
    if (index !== undefined) onSuccess?.(index);
  };

  const normalize = (value: string) =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ""); // removes spaces, _, -, (, ), etc.

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const rows: any[] = readFile(file ? await file.arrayBuffer() : null);
    setRows(rows);
    let reportDate = null;
    for (const row of rows) {
      for (const cell of row) {
        const match = cell.toString().match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
          const [, day, month, year] = match;
          reportDate = `${year}-${month}-${day}`;
          setReportDate(reportDate);
          break;
        }
      }
      if (reportDate) break;
    }
    if (!reportDate) {
      toastError("Report date is missing please check the file and try again");
      return;
    }
    const headerRowIndex = rows.findIndex((row) =>
      row.some(
        (cell: string) =>
          normalize(cell) === normalize("S No") ||
          normalize(cell) === normalize("Emp Code") ||
          normalize(cell) === normalize("Employee Code") ||
          normalize(cell) === normalize("Employee ID") ||
          normalize(cell) === normalize("Emp ID") ||
          normalize(cell) === normalize("ID") ||
          normalize(cell) === normalize("In Time") ||
          normalize(cell) === normalize("Punch In") ||
          normalize(cell) === normalize("Out Time") ||
          normalize(cell) === normalize("Punch Out") ||
          normalize(cell) === normalize("Check In") ||
          normalize(cell) === normalize("Check Out") ||
          normalize(cell) === normalize("Employee Name"),
      ),
    );

    if (headerRowIndex === -1) {
      toastError("Could not find attendance table");
      return;
    }
    setHeaderRowIndex(headerRowIndex);

    const header = rows[headerRowIndex];
    setHeaders(
      header.map((x: any) => ({ index: header.indexOf(x), value: x })),
    );

    header.map((x: string) => {
      const h = normalize(x);
      if (
        h.includes("code") ||
        h.includes("empcode") ||
        h.includes("employeeid") ||
        h.includes("employeecode") ||
        h.includes("id") ||
        h.includes("empid")
      ) {
        setMapFields((prev) => ({
          ...prev,
          emp_code: { value: x, index: header.indexOf(x) },
        }));
      }
      if (h.includes("in") || h.includes("intime")) {
        setMapFields((prev) => ({
          ...prev,
          in_time: { value: x, index: header.indexOf(x) },
        }));
      }
      if (h.includes("out") || h.includes("outtime")) {
        setMapFields((prev) => ({
          ...prev,
          out_time: { value: x, index: header.indexOf(x) },
        }));
      }
    });

    setOpen(true);
    event.target.value = "";
  };

  async function handleUploadAttendance(remark: string) {
    if (
      mapFields.emp_code.index === -1 ||
      mapFields.in_time.index === -1 ||
      mapFields.out_time.index === -1
    ) {
      toastError("Mapping fields are not properly set please check the file and try again");
      return;
    }

    const attendances = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const empCode = row[mapFields?.emp_code?.index];
      if (!empCode) continue;
      if (String(empCode).trim() === mapFields?.emp_code?.value) continue;
      if (Number.isNaN(Number(empCode))) continue;
      attendances.push({
        emp_code: String(empCode),
        check_in: convertTime(row[mapFields?.in_time?.index]),
        check_out: convertTime(row[mapFields?.out_time?.index]),
      });
    }

    await onUpload({
      date: reportDate!,
      attendances,
      org_uuid: uuid,
      type: UploadType.EXCEL_UPLOAD,
      remarks: remark,
    });

    setMapFields({
      emp_code: { index: -1, value: "" },
      in_time: { index: -1, value: "" },
      out_time: { index: -1, value: "" },
    });
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileUpload}
      />
      <FieldMappingDialog
        reportDate={reportDate}
        targetDate={targetDate}
        open={open}
        setOpen={setOpen}
        mapFields={mapFields}
        setMapFields={setMapFields}
        headers={headers}
        setPendingStatusChange={setPendingStatusChange}
        onConfirmUpload={handleUploadAttendance}
        isLoading={loading}
      />
    </div>
  );
}

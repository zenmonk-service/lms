import { AxiosResponse } from "axios";
import { saveAs } from "file-saver";

export const downloadBlobFile = (
  data: BlobPart,
  headers: AxiosResponse["headers"],
  defaultFileName = "Attendance.xlsx",
) => {
  const blob = new Blob([data], {
    type: headers["content-type"]?.toString(),
  });

  let fileName = defaultFileName;

  const disposition = headers["content-disposition"]?.toString();

  if (disposition) {
    const match = disposition.match(/filename="?(.+?)"?$/);
    if (match) {
      fileName = match[1];
    }
  }

  saveAs(blob, fileName);
};
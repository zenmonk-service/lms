import { AxiosResponse } from "axios";

interface IDownload {
  response: AxiosResponse<Blob | ArrayBuffer>;
  fileName?: string;
}

export const downloadExcelService = async ({
  response,
  fileName = "download.xlsx",
}: IDownload) => {
  const disposition = response.headers["content-disposition"];
  const name = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/)?.[1] ?? fileName;

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = decodeURIComponent(name);

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

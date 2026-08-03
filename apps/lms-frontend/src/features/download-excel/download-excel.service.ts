interface IDownload {
  response: Response;
  fileName?: string;
}

export const downloadExcelService = async ({
  response,
  fileName = "download.xlsx",
}: IDownload) => {
  if (!response.ok) {
    throw new Error("Failed to download attendance report");
  }

  const disposition = response.headers.get("content-disposition");

  const name =
    disposition?.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/)?.[1] ?? fileName;

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = decodeURIComponent(name);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

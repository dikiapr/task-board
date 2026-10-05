export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadFile = (content: string, fileName: string, type: string) =>
  downloadBlob(new Blob([content], { type }), fileName);

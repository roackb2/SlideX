export async function exportSlidexFile({
  content,
  defaultFilename,
  extension
}: {
  content: string;
  defaultFilename: string;
  extension: "html" | "mdx";
}) {
  try {
    const blob = new Blob([content], {
      type: extension === "html" ? "text/html;charset=utf-8" : "text/markdown;charset=utf-8"
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${defaultFilename}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return `${defaultFilename}.${extension}`;
  } catch (err) {
    console.error("Export failed:", err);
    return null;
  }
}

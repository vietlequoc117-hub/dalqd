
import * as pdfjsLib from 'pdfjs-dist';

// We use version 4.10.38 which is stable and widely supported.
// For modern environments using pdfjs-dist 4.0+, the worker must be loaded as an ESM module (.mjs).
const PDFJS_VERSION = '4.10.38';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Enabling useWorkerFetch ensures the browser uses the workerSrc provided above correctly.
      useWorkerFetch: true 
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    // Handle specific worker-related initialization errors gracefully.
    if (error instanceof Error && (error.message.includes("worker") || error.message.includes("module"))) {
      throw new Error("Lỗi khởi tạo bộ xử lý PDF. Vui lòng thử lại hoặc tải lại trang.");
    }
    throw new Error("Không thể trích xuất dữ liệu từ file PDF. Vui lòng đảm bảo file không bị lỗi hoặc có mật khẩu bảo vệ.");
  }
};

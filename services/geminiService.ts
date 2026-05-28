
import { GoogleGenAI, Type } from "@google/genai";
import { ExamData, SubjectConfig } from "../types";

export const processExamText = async (rawText: string, config: SubjectConfig): Promise<ExamData[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let rules = `Rules for extraction for subject ${config.name}:\n`;
  rules += `1. Part I: ${config.p1Count} multiple choice questions (A, B, C, or D).\n`;
  if (config.p2Count > 0) {
    rules += `2. Part II: ${config.p2Count} questions, each has 4 sub-parts (a, b, c, d) with Đ (True) or S (False). Combine into a 4-char string (e.g., "SDDS").\n`;
  } else {
    rules += `2. Part II: No questions. Return an empty array.\n`;
  }
  if (config.p3Count > 0) {
    rules += `3. Part III: ${config.p3Count} short answer questions. Extract numeric values.\n`;
  } else {
    rules += `3. Part III: No questions. Return an empty array.\n`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze the following text from a PDF of Vietnamese exam answer keys.
      Extract data for all Exam Codes (Mã đề) found.
      
      ${rules}
      
      Raw Text:
      ${rawText}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            examCode: { type: Type.STRING },
            part1: { type: Type.ARRAY, items: { type: Type.STRING } },
            part2: { type: Type.ARRAY, items: { type: Type.STRING } },
            part3: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["examCode", "part1", "part2", "part3"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text) as ExamData[];
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Không thể cấu trúc hóa dữ liệu. Vui lòng kiểm tra định dạng PDF.");
  }
};

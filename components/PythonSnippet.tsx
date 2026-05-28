
import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

const PythonSnippet: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const code = `import pandas as pd
import openpyxl
from openpyxl.styles import Alignment, Font

def create_math_answer_excel(data_list, output_filename="Dap_An_Toan.xlsx"):
    """
    data_list example: 
    [
        {"examCode": "0101", "part1": ["A", "B", ...], "part2": ["SDDS", ...], "part3": ["-1.5", ...]},
        ...
    ]
    """
    # Initialize the structured data rows
    # Row 1: Header Parts
    # Row 2: Counts (12, 4, 6)
    # Row 3: Exam Codes
    # Rows 4-25: Question values
    
    # We transpose the logic to build the Excel row by row
    rows = []
    
    # Building Header 1
    h1 = [""] + ["Phần I"] * 12 + ["Phần II"] * 4 + ["Phần III"] * 6
    rows.append(h1)
    
    # Building Header 2
    h2 = [""] + [12] * 12 + [4] * 4 + [6] * 6
    rows.append(h2)
    
    # Building Header 3 (Exam Codes)
    h3 = ["Mã đề"] + [d['examCode'] for d in data_list]
    
    # Note: To match the specific requirement of vertical exam codes in rows,
    # we follow the prompt's structural logic for the final output.
    
    # Let's create a DataFrame where each exam code is a column
    df_data = {}
    for item in data_list:
        all_answers = item['part1'] + item['part2'] + item['part3']
        df_data[item['examCode']] = all_answers
        
    df = pd.DataFrame(df_data)
    
    # Insert question labels
    labels = [f"Q{i+1} (P1)" for i in range(12)] + \\
             [f"Q{i+1} (P2)" for i in range(4)] + \\
             [f"Q{i+1} (P3)" for i in range(6)]
    df.insert(0, "Câu hỏi", labels)
    
    # Export using openpyxl for formatting
    with pd.ExcelWriter(output_filename, engine='openpyxl') as writer:
        # We handle custom headers manually to satisfy the merge requirements
        df.to_excel(writer, index=False, startrow=2)
        
        workbook = writer.book
        worksheet = writer.sheets['Sheet1']
        
        # Write Parts Headers and merge
        worksheet.merge_cells(start_row=1, start_column=2, end_row=1, end_column=13)
        worksheet['B1'] = "Phần I"
        worksheet.merge_cells(start_row=1, start_column=14, end_row=1, end_column=17)
        worksheet['N1'] = "Phần II"
        worksheet.merge_cells(start_row=1, start_column=18, end_row=1, end_column=23)
        worksheet['R1'] = "Phần III"
        
        # Write question counts
        for col in range(2, 14): worksheet.cell(row=2, column=col, value=12)
        for col in range(14, 18): worksheet.cell(row=2, column=col, value=4)
        for col in range(18, 24): worksheet.cell(row=2, column=col, value=6)

    print(f"Successfully saved to {output_filename}")

# Usage
# data = [{"examCode": "101", "part1": ["A"]*12, "part2": ["SDDS"]*4, "part3": ["0"]*6}]
# create_math_answer_excel(data)
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Python Data Processing Script</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default PythonSnippet;

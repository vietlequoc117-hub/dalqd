
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, CheckCircle2, RefreshCw, Download, FileText, XCircle } from 'lucide-react';
import { extractTextFromPdf } from './services/pdfService';
import { processExamText } from './services/geminiService';
import { exportToExcel } from './services/excelService';
import { ProcessingState, SubjectConfig, FileResult } from './types';

const getSubjectConfig = (filename: string): SubjectConfig => {
  const name = filename.toUpperCase();
  
  // Toán (12-4-6)
  if (name.includes('TOAN')) return { id: 'Toan', name: 'Toán', p1Count: 12, p2Count: 4, p3Count: 6 };
  
  // Lí, Hóa, Sinh, Địa (18-4-6)
  if (name.includes('LI')) return { id: 'Li', name: 'Vật Lí', p1Count: 18, p2Count: 4, p3Count: 6 };
  if (name.includes('HOA')) return { id: 'Hoa', name: 'Hóa Học', p1Count: 18, p2Count: 4, p3Count: 6 };
  if (name.includes('SINH')) return { id: 'Sinh', name: 'Sinh Học', p1Count: 18, p2Count: 4, p3Count: 6 };
  if (name.includes('DIA')) return { id: 'Dia', name: 'Địa Lí', p1Count: 18, p2Count: 4, p3Count: 6 };
  
  // Sử, Tin, CNNN, CNCN, KTPL (24-4-0)
  if (name.includes('SU')) return { id: 'Su', name: 'Lịch Sử', p1Count: 24, p2Count: 4, p3Count: 0 };
  if (name.includes('TIN')) return { id: 'Tin', name: 'Tin Học', p1Count: 24, p2Count: 4, p3Count: 0 };
  if (name.includes('CNNN')) return { id: 'CNNN', name: 'Công Nghệ NN', p1Count: 24, p2Count: 4, p3Count: 0 };
  if (name.includes('CNCN')) return { id: 'CNCN', name: 'Công Nghệ CN', p1Count: 24, p2Count: 4, p3Count: 0 };
  if (name.includes('KTPL')) return { id: 'KTPL', name: 'KT & Pháp Luật', p1Count: 24, p2Count: 4, p3Count: 0 };
  
  // Anh (40-0-0)
  if (name.includes('ANH')) return { id: 'Anh', name: 'Tiếng Anh', p1Count: 40, p2Count: 0, p3Count: 0 };
  
  // Mặc định
  return { id: 'Toan', name: 'Mặc định (Toán)', p1Count: 12, p2Count: 4, p3Count: 6 };
};

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    results: []
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const initialResults: FileResult[] = files.map(file => ({
      filename: file.name,
      config: getSubjectConfig(file.name),
      data: null,
      status: 'pending'
    }));

    setState({ isProcessing: true, progress: 0, results: initialResults });

    let completed = 0;
    const newResults = [...initialResults];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newResults[i].status = 'processing';
      setState(prev => ({ ...prev, results: [...newResults], progress: (completed / files.length) * 100 }));

      try {
        const rawText = await extractTextFromPdf(file);
        const structuredData = await processExamText(rawText, newResults[i].config);
        newResults[i].data = structuredData;
        newResults[i].status = 'success';
      } catch (err: any) {
        newResults[i].status = 'error';
        newResults[i].error = err.message;
      }

      completed++;
      setState(prev => ({ ...prev, results: [...newResults], progress: (completed / files.length) * 100 }));
    }

    setState(prev => ({ ...prev, isProcessing: false, progress: 100 }));
  };

  const reset = () => setState({ isProcessing: false, progress: 0, results: [] });

  const downloadAll = () => {
    state.results.forEach(res => {
      if (res.status === 'success' && res.data) {
        exportToExcel(res.data, res.config, res.filename);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <FileSpreadsheet className="text-green-700" size={28} /> 
            Hệ thống trích xuất đáp án thông minh
          </h1>
        </header>

        <main>
          {state.results.length === 0 && !state.isProcessing && (
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-12 cursor-pointer hover:bg-slate-50 transition-all">
                <Upload className="text-slate-400 mb-4" size={48} />
                <span className="text-slate-700 font-semibold text-lg text-center">Tải file PDF đáp án lên (có thể chọn nhiều file)</span>
                <p className="text-slate-500 text-xs mt-4 text-center leading-relaxed">
                  Hệ thống tự nhận diện môn học qua tên file:<br/>
                  <b>Toan</b> (12-4-6) | <b>Li/Hoa/Sinh/Dia</b> (18-4-6)<br/>
                  <b>Su/Tin/CN/KTPL</b> (24-4-0) | <b>Anh</b> (40-0-0)
                </p>
                <input type="file" multiple className="hidden" accept=".pdf" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {(state.isProcessing || state.results.length > 0) && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden">
                <div className="p-4 bg-slate-100 border-b border-slate-300 flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                    <FileText size={20} className="text-blue-600" /> Danh sách file đã xử lý
                  </span>
                  <div className="flex gap-2">
                    <button onClick={reset} className="px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-all flex items-center gap-1.5 text-sm font-semibold">
                      <RefreshCw size={16} /> Làm lại
                    </button>
                    {!state.isProcessing && state.results.some(r => r.status === 'success') && (
                      <button onClick={downloadAll} className="bg-green-700 text-white px-5 py-2 rounded font-bold flex items-center gap-2 hover:bg-green-800 transition-all shadow-md">
                        <Download size={18} /> Tải tất cả Excel
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {state.isProcessing && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                        <span>Đang xử lý...</span>
                        <span>{Math.round(state.progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {state.results.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          {res.status === 'pending' && <Loader2 className="text-slate-400" size={20} />}
                          {res.status === 'processing' && <Loader2 className="animate-spin text-blue-600" size={20} />}
                          {res.status === 'success' && <CheckCircle2 className="text-green-600" size={20} />}
                          {res.status === 'error' && <XCircle className="text-red-600" size={20} />}
                          
                          <div>
                            <p className="font-semibold text-slate-800">{res.filename}</p>
                            <p className="text-xs text-slate-500">Môn: {res.config.name}</p>
                          </div>
                        </div>

                        <div>
                          {res.status === 'error' && (
                            <span className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle size={14} /> {res.error}
                            </span>
                          )}
                          {res.status === 'success' && res.data && (
                            <button 
                              onClick={() => exportToExcel(res.data!, res.config, res.filename)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-semibold transition-colors"
                            >
                              <FileSpreadsheet size={16} /> Tải Excel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

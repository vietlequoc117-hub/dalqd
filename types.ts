
export interface ExamData {
  examCode: string;
  part1: string[]; 
  part2: string[]; 
  part3: string[]; 
}

export interface SubjectConfig {
  id: string;
  name: string;
  p1Count: number;
  p2Count: number;
  p3Count: number;
}

export interface FileResult {
  filename: string;
  config: SubjectConfig;
  data: ExamData[] | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  results: FileResult[];
}

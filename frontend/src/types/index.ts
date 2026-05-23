export interface QuestionTypeConfig {
  type: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questionType: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  timeAllowed: string;
  totalMarks: number;
  sections: Section[];
  answerKey: { questionNumber: number; answer: string }[];
  createdAt: string;
}

export interface Assignment {
  _id: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WSMessage {
  type: 'connected' | 'progress' | 'completed' | 'failed';
  assignmentId?: string;
  status?: string;
  progress?: number;
  message?: string;
  paper?: GeneratedPaper;
  error?: string;
}

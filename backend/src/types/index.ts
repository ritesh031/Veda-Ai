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

export interface AssignmentInput {
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  fileContent?: string;
}

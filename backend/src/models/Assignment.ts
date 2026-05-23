import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  subject: string;
  dueDate: Date;
  questionTypes: { type: string; numberOfQuestions: number; marksPerQuestion: number }[];
  additionalInstructions?: string;
  fileContent?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  generatedPaper?: any;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: [
      {
        type: { type: String, required: true },
        numberOfQuestions: { type: Number, required: true },
        marksPerQuestion: { type: Number, required: true },
      },
    ],
    additionalInstructions: { type: String },
    fileContent: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    generatedPaper: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

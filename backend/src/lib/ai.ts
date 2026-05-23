import Groq from 'groq-sdk';
import { AssignmentInput, GeneratedPaper, Section, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export function buildPrompt(input: AssignmentInput): string {
  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.numberOfQuestions, 0);
  const totalMarks = input.questionTypes.reduce((s, q) => s + q.numberOfQuestions * q.marksPerQuestion, 0);

  const sectionsList = input.questionTypes
    .map((qt, i) => {
      const secLabel = String.fromCharCode(65 + i);
      return `Section ${secLabel}: ${qt.numberOfQuestions} x ${qt.type} questions, ${qt.marksPerQuestion} marks each`;
    })
    .join('\n');

  return `You are an expert educator. Create a complete exam question paper.

Subject: ${input.subject}
Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}
${input.additionalInstructions ? `Special Instructions: ${input.additionalInstructions}` : ''}
${input.fileContent ? `\nReference material:\n${input.fileContent.slice(0, 2000)}` : ''}

Sections to generate:
${sectionsList}

Rules:
- Mix difficulty: ~30% easy, ~50% medium, ~20% hard per section
- Questions must be specific, educational, and appropriate
- Provide an answer key for ALL questions
- Never repeat questions

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "title": "descriptive exam title",
  "subject": "${input.subject}",
  "className": "infer from instructions or use 'General'",
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "timeAllowed": "X Hours Y Minutes",
  "totalMarks": ${totalMarks},
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questionType": "Short Answer Questions",
      "questions": [
        {
          "text": "full question text here",
          "difficulty": "easy",
          "marks": 2,
          "type": "Short Answer"
        }
      ]
    }
  ],
  "answerKey": [
    { "questionNumber": 1, "answer": "complete answer here" }
  ]
}

Generate exactly ${totalQuestions} questions total, distributed across sections as specified.`;
}

export async function generateQuestionPaper(input: AssignmentInput): Promise<GeneratedPaper> {
  const prompt = buildPrompt(input);

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',   // free & fast on Groq
    max_tokens: 6000,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: 'You are an expert educator. Always respond with valid JSON only. No markdown, no explanation.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const rawText = response.choices[0]?.message?.content || '';
  return parseAndValidate(rawText, input);
}

function parseAndValidate(rawText: string, input: AssignmentInput): GeneratedPaper {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  let data: any;

  try {
    data = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) data = JSON.parse(match[0]);
    else throw new Error('Could not parse AI response as JSON');
  }

  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.numberOfQuestions * q.marksPerQuestion, 0
  );

  const sections: Section[] = (data.sections || []).map((s: any, si: number) => {
    const qt = input.questionTypes[si];
    const questions: Question[] = (s.questions || []).map((q: any, qi: number) => ({
      id: `q-${si}-${qi}-${uuidv4().slice(0, 4)}`,
      text: q.text || `Question ${qi + 1}`,
      difficulty: normalizeDiff(q.difficulty),
      marks: Number(q.marks) || (qt?.marksPerQuestion ?? 1),
      type: q.type || qt?.type || 'Short Answer',
    }));
    return {
      id: `sec-${si}-${uuidv4().slice(0, 4)}`,
      title: s.title || `Section ${String.fromCharCode(65 + si)}`,
      instruction: s.instruction || 'Attempt all questions.',
      questionType: s.questionType || qt?.type || 'Questions',
      questions,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    };
  });

  return {
    title: data.title || `${input.subject} Examination`,
    subject: data.subject || input.subject,
    className: data.className || 'General',
    schoolName: data.schoolName || 'Delhi Public School, Sector-4, Bokaro',
    timeAllowed: data.timeAllowed || '2 Hours',
    totalMarks: data.totalMarks || totalMarks,
    sections,
    answerKey: data.answerKey || [],
    createdAt: new Date().toISOString(),
  };
}

function normalizeDiff(d: string): 'easy' | 'medium' | 'hard' {
  const l = (d || '').toLowerCase();
  if (l === 'easy' || l === 'simple') return 'easy';
  if (l === 'hard' || l === 'difficult' || l === 'challenging') return 'hard';
  return 'medium';
}
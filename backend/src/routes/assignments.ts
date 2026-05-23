import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Assignment } from '../models/Assignment';
import { generationQueue, getCached, setCache, deleteCache } from '../lib/queue';

const router = Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['.pdf', '.txt'].includes(path.extname(file.originalname).toLowerCase());
    if (ok) { cb(null, true); } else { cb(null, false); }
  },
});

// ── Create ──────────────────────────────────────────────────────────────────
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { subject, dueDate, additionalInstructions } = req.body;

    if (!subject?.trim()) return res.status(400).json({ error: 'Subject is required' });
    if (!dueDate) return res.status(400).json({ error: 'Due date is required' });

    let questionTypes: any[] = [];
    try {
      questionTypes = JSON.parse(req.body.questionTypes || '[]');
    } catch {
      return res.status(400).json({ error: 'Invalid questionTypes format' });
    }

    if (!questionTypes.length) return res.status(400).json({ error: 'At least one question type is required' });

    for (const qt of questionTypes) {
      if (!qt.type?.trim()) return res.status(400).json({ error: 'Each question type needs a name' });
      if (!qt.numberOfQuestions || qt.numberOfQuestions < 1)
        return res.status(400).json({ error: `"${qt.type}" needs at least 1 question` });
      if (!qt.marksPerQuestion || qt.marksPerQuestion < 1)
        return res.status(400).json({ error: `"${qt.type}" marks must be at least 1` });
    }

    // Parse uploaded file
    let fileContent = '';
    if (req.file) {
      try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.txt') {
          fileContent = fs.readFileSync(req.file.path, 'utf-8');
        } else if (ext === '.pdf') {
          const pdfParse = require('pdf-parse');
          fileContent = (await pdfParse(fs.readFileSync(req.file.path))).text;
        }
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('File parse error:', e);
      }
    }

    const assignment = await Assignment.create({
      subject, dueDate: new Date(dueDate), questionTypes,
      additionalInstructions, fileContent, status: 'pending',
    });

    const input = { subject, dueDate, questionTypes, additionalInstructions, fileContent };
    const job = await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(), input,
    });

    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

    res.status(201).json({
      assignmentId: assignment._id.toString(),
      jobId: job.id,
      status: 'pending',
    });
  } catch (err: any) {
    console.error('Create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── List ─────────────────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const list = await Assignment.find()
      .select('-fileContent -generatedPaper')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get one ───────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const cached = await getCached(`assignment:${req.params.id}`);
    if (cached) return res.json(cached);

    const doc = await Assignment.findById(req.params.id).select('-fileContent');
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status === 'completed') await setCache(`assignment:${req.params.id}`, doc.toJSON());
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get paper ────────────────────────────────────────────────────────────────
router.get('/:id/paper', async (req, res) => {
  try {
    const cached = await getCached(`paper:${req.params.id}`);
    if (cached) return res.json(cached);

    const doc = await Assignment.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status !== 'completed')
      return res.status(202).json({ status: doc.status, message: 'Not ready yet' });

    await setCache(`paper:${req.params.id}`, doc.generatedPaper);
    res.json(doc.generatedPaper);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Regenerate ────────────────────────────────────────────────────────────────
router.post('/:id/regenerate', async (req, res) => {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    await deleteCache(`paper:${req.params.id}`);
    await deleteCache(`assignment:${req.params.id}`);
    await Assignment.findByIdAndUpdate(req.params.id, { status: 'pending', generatedPaper: null });

    const input = {
      subject: doc.subject, dueDate: doc.dueDate.toISOString(),
      questionTypes: doc.questionTypes, additionalInstructions: doc.additionalInstructions,
      fileContent: doc.fileContent,
    };
    const job = await generationQueue.add('generate', {
      assignmentId: req.params.id, input,
    });
    await Assignment.findByIdAndUpdate(req.params.id, { jobId: job.id });
    res.json({ status: 'pending', jobId: job.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await deleteCache(`paper:${req.params.id}`);
    await deleteCache(`assignment:${req.params.id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── PDF Download ──────────────────────────────────────────────────────────────
router.get('/:id/pdf', async (req, res) => {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc || doc.status !== 'completed')
      return res.status(404).json({ error: 'Paper not ready' });

    const paper = doc.generatedPaper;
    const PDFDocument = require('pdfkit');
    const pdf = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="paper-${req.params.id}.pdf"`);
    pdf.pipe(res);

    // School / header
    pdf.fontSize(16).font('Helvetica-Bold').text(paper.schoolName, { align: 'center' });
    pdf.fontSize(13).font('Helvetica').text(`Subject: ${paper.subject}`, { align: 'center' });
    pdf.fontSize(13).text(`Class: ${paper.className}`, { align: 'center' });
    pdf.moveDown(0.5);

    pdf.moveTo(50, pdf.y).lineTo(545, pdf.y).stroke();
    pdf.moveDown(0.3);

    // Meta row
    pdf.fontSize(11).font('Helvetica')
      .text(`Time Allowed: ${paper.timeAllowed}`, 50, pdf.y, { continued: true, width: 250 })
      .text(`Maximum Marks: ${paper.totalMarks}`, { align: 'right' });
    pdf.moveDown(0.5);

    pdf.fontSize(11).font('Helvetica-Oblique').text('All questions are compulsory unless stated otherwise.');
    pdf.moveDown(0.5);

    // Student info
    pdf.font('Helvetica').text('Name: ________________  Roll Number: __________  Class: ___ Section: ____');
    pdf.moveDown(0.8);
    pdf.moveTo(50, pdf.y).lineTo(545, pdf.y).stroke();
    pdf.moveDown(0.5);

    // Sections
    let qGlobal = 1;
    for (const section of paper.sections) {
      pdf.fontSize(13).font('Helvetica-Bold').text(section.title, { align: 'center' });
      pdf.fontSize(10).font('Helvetica-Oblique').text(section.instruction, { align: 'center' });
      pdf.moveDown(0.4);

      for (const q of section.questions) {
        const diff = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
        pdf.fontSize(11).font('Helvetica')
          .text(`${qGlobal}. ${q.text}`);
        pdf.fontSize(9).font('Helvetica-Oblique')
          .text(`   [${diff}]  [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`);
        pdf.moveDown(0.4);
        qGlobal++;
      }
      pdf.moveDown(0.5);
    }

    // Answer key
    if (paper.answerKey?.length) {
      pdf.addPage();
      pdf.fontSize(14).font('Helvetica-Bold').text('Answer Key', { align: 'center' });
      pdf.moveDown(0.5);
      for (const ak of paper.answerKey) {
        pdf.fontSize(11).font('Helvetica')
          .text(`${ak.questionNumber}. ${ak.answer}`);
        pdf.moveDown(0.3);
      }
    }

    pdf.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

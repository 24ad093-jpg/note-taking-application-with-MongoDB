import { Router } from 'express';
import mongoose from 'mongoose';
import Note from '../models/Note.js';

const router = Router();

function validateId(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: 'The note ID is not a valid MongoDB ObjectId.' });
  }
  return next();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const filter = search
    ? { $or: [{ title: new RegExp(escapeRegExp(search), 'i') }, { content: new RegExp(escapeRegExp(search), 'i') }] }
    : {};
  const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
  res.json({ notes });
});

router.get('/:id', validateId, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  return res.json({ note });
});

router.post('/', async (req, res) => {
  const note = await Note.create(req.body);
  return res.status(201).json({ note, message: 'Note created.' });
});

router.put('/:id', validateId, async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    overwrite: false,
  });
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  return res.json({ note, message: 'Note updated.' });
});

router.delete('/:id', validateId, async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  return res.json({ message: 'Note deleted.' });
});

export default router;

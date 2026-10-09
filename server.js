import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import notesRouter from './routes/notes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDirectory, '../client/dist');

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/notes', notesRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.method === 'GET') return res.sendFile(path.join(clientDist, 'index.html'), (error) => error && next(error));
  return next();
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ error: details.join(' ') });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'The supplied value is invalid.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    error: error.status && error.status < 500 ? error.message : 'Something went wrong. Please try again.',
  });
});

try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing. Add it to server/.env.');
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`My Notes API is running at http://localhost:${port}`));
} catch (error) {
  console.error(`Unable to start the server: ${error.message}`);
  process.exit(1);
}

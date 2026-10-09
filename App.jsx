import { useEffect, useState } from 'react';
import { BookOpen, Search, X, NotebookPen, LoaderCircle, StickyNote } from 'lucide-react';
import NoteForm from './components/NoteForm.jsx';
import NoteCard from './components/NoteCard.jsx';
import EditModal from './components/EditModal.jsx';
import { notesApi } from './api.js';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    notesApi.list(debouncedSearch)
      .then(({ notes: result }) => active && setNotes(result))
      .catch((error) => active && setFeedback({ type: 'error', text: error.message }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  async function createNote(note) {
    setCreating(true);
    try {
      const { note: created } = await notesApi.create(note);
      setNotes((current) => [created, ...current]);
      setFeedback({ type: 'success', text: 'Your note is saved.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
      throw error;
    } finally {
      setCreating(false);
    }
  }

  async function saveNote(id, draft) {
    setSaving(true);
    try {
      const { note: updated } = await notesApi.update(id, draft);
      setNotes((current) => current.map((item) => item._id === id ? updated : item).sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt)));
      setEditingNote(null);
      setFeedback({ type: 'success', text: 'Changes saved.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(note) {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    try {
      await notesApi.remove(note._id);
      setNotes((current) => current.filter((item) => item._id !== note._id));
      setFeedback({ type: 'success', text: 'Note deleted.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    }
  }

  async function togglePin(note) {
    try {
      const { note: updated } = await notesApi.update(note._id, { pinned: !note.pinned });
      setNotes((current) => current.map((item) => item._id === note._id ? updated : item).sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt)));
      setFeedback({ type: 'success', text: updated.pinned ? 'Note pinned.' : 'Note unpinned.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    }
  }

  const pinnedNotes = notes.filter((note) => note.pinned);
  const otherNotes = notes.filter((note) => !note.pinned);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="My Notes home">
          <span className="brand-mark"><BookOpen size={20} strokeWidth={2.1} /></span>
          <span>My <strong>Notes</strong></span>
        </a>
        <div className="search-box">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="note-search">Search notes</label>
          <input id="note-search" type="search" placeholder="Search your notes" value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}
          <kbd>/</kbd>
        </div>
        <div className="header-caption"><span className="status-dot" /> Your thoughts, in one place</div>
      </header>

      <main>
        <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR PERSONAL NOTEBOOK</p>
            <h1>Make room for <span>ideas.</span></h1>
            <p className="welcome-copy">A little space to collect the things worth remembering.</p>
          </div>
          <div className="note-count"><NotebookPen size={17} /><span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span></div>
        </section>

        {feedback && <div className={`feedback feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</div>}
        <NoteForm onCreate={createNote} submitting={creating} />

        <section className="notes-section" aria-live="polite">
          <div className="section-heading">
            <div><span className="section-index">01</span><h2>{debouncedSearch ? 'Search results' : 'Your collection'}</h2></div>
            {debouncedSearch && <span className="results-label">for “{debouncedSearch}”</span>}
          </div>

          {loading ? (
            <div className="loading-state"><LoaderCircle className="spinner" size={23} /><span>Gathering your notes...</span></div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><StickyNote size={27} /></div>
              <h3>{debouncedSearch ? 'No notes found' : 'A fresh page'}</h3>
              <p>{debouncedSearch ? 'Try a different title or phrase.' : 'Your next good idea can start right above.'}</p>
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 && <NoteGroup title="Pinned" notes={pinnedNotes} onEdit={setEditingNote} onDelete={deleteNote} onTogglePin={togglePin} />}
              {otherNotes.length > 0 && <NoteGroup title={pinnedNotes.length ? 'Other notes' : ''} notes={otherNotes} onEdit={setEditingNote} onDelete={deleteNote} onTogglePin={togglePin} />}
            </>
          )}
        </section>
      </main>

      <footer className="page-footer"><span>MY NOTES</span><span>Keep the good ideas close.</span></footer>
      {editingNote && <EditModal note={editingNote} onClose={() => setEditingNote(null)} onSave={saveNote} saving={saving} />}
    </div>
  );
}

function NoteGroup({ title, notes, onEdit, onDelete, onTogglePin }) {
  return (
    <div className="note-group">
      {title && <h3 className="group-title">{title}<span>{String(notes.length).padStart(2, '0')}</span></h3>}
      <div className="notes-grid">
        {notes.map((note) => <NoteCard key={note._id} note={note} onEdit={onEdit} onDelete={onDelete} onTogglePin={onTogglePin} />)}
      </div>
    </div>
  );
}

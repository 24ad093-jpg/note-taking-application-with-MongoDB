import { useState } from 'react';
import { Pin, Plus } from 'lucide-react';
import ColorPicker from './ColorPicker.jsx';

const emptyNote = { title: '', content: '', color: 'white', pinned: false };

export default function NoteForm({ onCreate, submitting }) {
  const [note, setNote] = useState(emptyNote);
  const [error, setError] = useState('');

  function update(field, value) {
    setNote((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!note.title.trim() || !note.content.trim()) {
      setError('Add both a title and some note content.');
      return;
    }
    setError('');
    try {
      await onCreate({ ...note, title: note.title.trim() });
      setNote(emptyNote);
    } catch {
      // The parent displays the request error.
    }
  }

  return (
    <form className={`composer note-${note.color}`} onSubmit={handleSubmit}>
      <div className="composer-heading">
        <span className="composer-kicker">A place for your thoughts</span>
        <button
          className={`pin-toggle${note.pinned ? ' active' : ''}`}
          type="button"
          aria-pressed={note.pinned}
          onClick={() => update('pinned', !note.pinned)}
          title={note.pinned ? 'Unpin this note' : 'Pin this note'}
        >
          <Pin size={16} /> <span>{note.pinned ? 'Pinned' : 'Pin note'}</span>
        </button>
      </div>
      <label className="sr-only" htmlFor="new-note-title">Title</label>
      <input
        id="new-note-title"
        className="title-input"
        value={note.title}
        maxLength={100}
        placeholder="Give this note a title"
        onChange={(event) => update('title', event.target.value)}
      />
      <label className="sr-only" htmlFor="new-note-content">Note content</label>
      <textarea
        id="new-note-content"
        className="content-input"
        value={note.content}
        maxLength={5000}
        placeholder="Start writing..."
        rows={3}
        onChange={(event) => update('content', event.target.value)}
      />
      <div className="composer-footer">
        <ColorPicker value={note.color} onChange={(value) => update('color', value)} />
        <button className="primary-button add-button" type="submit" disabled={submitting}>
          <Plus size={17} strokeWidth={2.5} /> {submitting ? 'Adding...' : 'Add note'}
        </button>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </form>
  );
}

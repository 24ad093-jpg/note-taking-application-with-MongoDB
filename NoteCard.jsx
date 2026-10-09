import { Pin, Pencil, Trash2 } from 'lucide-react';

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const updated = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(note.updatedAt));

  return (
    <article className={`note-card note-${note.color}${note.pinned ? ' note-card-pinned' : ''}`}>
      <div className="note-card-topline">
        <span className="note-date">Updated {updated}</span>
        {note.pinned && <span className="pinned-label"><Pin size={12} fill="currentColor" /> Pinned</span>}
      </div>
      <h2>{note.title}</h2>
      <p className="note-content">{note.content}</p>
      <div className="note-card-actions">
        <button className="icon-button" type="button" aria-label="Edit note" title="Edit note" onClick={() => onEdit(note)}>
          <Pencil size={16} />
        </button>
        <button className="icon-button" type="button" aria-label={note.pinned ? 'Unpin note' : 'Pin note'} title={note.pinned ? 'Unpin note' : 'Pin note'} onClick={() => onTogglePin(note)}>
          <Pin size={16} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>
        <button className="icon-button delete-action" type="button" aria-label="Delete note" title="Delete note" onClick={() => onDelete(note)}>
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

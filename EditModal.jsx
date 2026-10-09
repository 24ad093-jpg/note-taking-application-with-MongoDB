import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import ColorPicker from './ColorPicker.jsx';

export default function EditModal({ note, onClose, onSave, saving }) {
  const [draft, setDraft] = useState({ title: note.title, content: note.content, color: note.color, pinned: note.pinned });
  const [error, setError] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      setError('A title and note content are required.');
      return;
    }
    setError('');
    try {
      await onSave(note._id, { ...draft, title: draft.title.trim() });
    } catch {
      // The parent displays the request error.
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`edit-modal note-${draft.color}`} role="dialog" aria-modal="true" aria-labelledby="edit-heading">
        <div className="modal-heading">
          <div><span className="composer-kicker">Make it yours</span><h2 id="edit-heading">Edit note</h2></div>
          <button className="icon-button modal-close" type="button" aria-label="Close edit dialog" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="edit-title">Title</label>
          <input id="edit-title" className="title-input modal-input" value={draft.title} maxLength={100} onChange={(event) => update('title', event.target.value)} />
          <label className="field-label" htmlFor="edit-content">Content</label>
          <textarea id="edit-content" className="content-input modal-textarea" value={draft.content} maxLength={5000} rows={7} onChange={(event) => update('content', event.target.value)} />
          <div className="modal-options">
            <ColorPicker value={draft.color} onChange={(value) => update('color', value)} />
            <label className="check-control"><input type="checkbox" checked={draft.pinned} onChange={(event) => update('pinned', event.target.checked)} /> Keep pinned</label>
          </div>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}><Check size={16} /> {saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

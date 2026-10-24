import { useRef, useState, type FormEvent } from 'react';
import { errMsg, type ShowcaseItem, type ShowcaseKind } from '../lib/core';
import {
  BUCKETS,
  deleteShowcase,
  fetchShowcase,
  removeStoredImage,
  saveShowcase,
  uploadImage,
} from '../lib/data';
import { PrinterIllustration, SafeImage } from '../components/art';
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  NoticeBar,
  Spinner,
  useLoad,
  useNotice,
} from '../components/ui';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';

const COPY = {
  work: {
    heading: 'Works',
    intro: 'Past work shown in the Our Work slideshow on the website.',
    singular: 'work',
    titleLabel: 'Work title *',
    imageLabel: 'Photo',
    descLabel: 'Short description',
    addLabel: 'Add work',
    emptyTitle: 'No work added yet.',
    emptyText:
      'Add your first piece of past work. It will appear in the slideshow once it is published.',
  },
  client: {
    heading: 'Clients',
    intro: 'Clients shown in the Our Clients slideshow on the website.',
    singular: 'client',
    titleLabel: 'Client name *',
    imageLabel: 'Logo or photo',
    descLabel: 'Short note (optional)',
    addLabel: 'Add client',
    emptyTitle: 'No clients added yet.',
    emptyText:
      'Add a client. It will appear in the slideshow once it is published.',
  },
} as const;

function ShowcaseForm({
  kind,
  item,
  onCancel,
  onSaved,
}: {
  kind: ShowcaseKind;
  item: ShowcaseItem | null;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const copy = COPY[kind];
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '');
  const [published, setPublished] = useState(item?.is_published ?? true);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFormError(null);
    setUploading(true);
    try {
      setImageUrl(await uploadImage(BUCKETS.showcase, file));
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
    setFormError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError('This field is required.');
      return;
    }
    if (trimmed.length > 200) {
      setTitleError('Keep this under 200 characters.');
      return;
    }
    if (description.length > 1000) {
      setFormError('The description must be under 1000 characters.');
      return;
    }
    setTitleError(null);
    setSaving(true);
    try {
      await saveShowcase(item?.id ?? null, {
        kind,
        title: trimmed,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_published: published,
      });
      if (item && item.image_url && item.image_url !== imageUrl.trim()) {
        await removeStoredImage(BUCKETS.showcase, item.image_url);
      }
      onSaved(item ? `Updated ${copy.singular}.` : `Added ${copy.singular}.`);
    } catch (err) {
      setFormError(errMsg(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={item ? `Edit ${copy.singular}` : copy.addLabel}
      onClose={onCancel}
    >
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="notice notice-error" role="alert">
            <span>{formError}</span>
          </div>
        )}
        <div className="field">
          <label htmlFor="s-title">{copy.titleLabel}</label>
          <input
            id="s-title"
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            aria-invalid={Boolean(titleError)}
          />
          {titleError && <p className="field-error">{titleError}</p>}
        </div>
        <div className="field">
          <label htmlFor="s-desc">{copy.descLabel}</label>
          <textarea
            id="s-desc"
            className="input textarea"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <span className="label">{copy.imageLabel}</span>
          <div className="upload-row">
            <input
              ref={fileRef}
              id="s-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={e => onFile(e.target.files?.[0])}
            />
            <label htmlFor="s-file" className="btn btn-outline btn-sm">
              <Upload size={16} aria-hidden="true" />{' '}
              {uploading ? 'Uploading...' : 'Upload image'}
            </label>
            {imageUrl && (
              <button
                type="button"
                className="btn btn-ghost-dark btn-sm"
                onClick={() => setImageUrl('')}
              >
                Remove image
              </button>
            )}
          </div>
          {imageUrl && (
            <div className="upload-preview">
              <SafeImage
                src={imageUrl}
                alt="Selected image preview"
                fallback={
                  <p className="help">The image could not be displayed.</p>
                }
              />
            </div>
          )}
          <p className="help">JPG, PNG or WebP, up to 5 MB.</p>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
          />
          <span>Published (visible on the website)</span>
        </label>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || uploading}
          >
            {saving ? 'Saving...' : item ? 'Save changes' : copy.addLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminShowcase({ kind }: { kind: ShowcaseKind }) {
  const copy = COPY[kind];
  const { data, loading, error, reload } = useLoad(
    () => fetchShowcase(kind, false),
    [kind]
  );
  const { notice, setNotice } = useNotice();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ShowcaseItem | null>(null);
  const [deleting, setDeleting] = useState<ShowcaseItem | null>(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteShowcase(deleting.id);
      await removeStoredImage(BUCKETS.showcase, deleting.image_url);
      setNotice({ type: 'success', text: `Deleted "${deleting.title}".` });
      setDeleting(null);
      reload();
    } catch (e) {
      setNotice({ type: 'error', text: errMsg(e) });
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const items = data ?? [];

  return (
    <div>
      <div className="admin-head">
        <div>
          <h1>{copy.heading}</h1>
          <p className="muted">{copy.intro}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setAdding(true)}
        >
          <Plus size={18} aria-hidden="true" /> {copy.addLabel}
        </button>
      </div>

      <NoticeBar notice={notice} onClose={() => setNotice(null)} />

      {loading && !data && <Spinner label="Loading" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && items.length === 0 && (
        <EmptyState title={copy.emptyTitle} text={copy.emptyText} />
      )}

      {items.length > 0 && (
        <ul className="admin-grid">
          {items.map(item => (
            <li key={item.id} className="admin-card">
              <div
                className={
                  kind === 'client'
                    ? 'admin-card-media is-contain'
                    : 'admin-card-media'
                }
              >
                <SafeImage
                  src={item.image_url}
                  alt={item.title}
                  fallback={
                    <div className="ph">
                      <PrinterIllustration />
                    </div>
                  }
                />
              </div>
              <div className="admin-card-body">
                <strong>{item.title}</strong>
                {item.description && (
                  <p className="muted small clamp-2">{item.description}</p>
                )}
                <span
                  className={
                    item.is_published
                      ? 'badge badge-in-stock'
                      : 'badge badge-to-be-confirmed'
                  }
                >
                  {item.is_published ? 'Published' : 'Hidden'}
                </span>
              </div>
              <div className="admin-card-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditing(item)}
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil size={15} aria-hidden="true" /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => setDeleting(item)}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={15} aria-hidden="true" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(adding || editing) && (
        <ShowcaseForm
          kind={kind}
          item={editing}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSaved={message => {
            setAdding(false);
            setEditing(null);
            setNotice({ type: 'success', text: message });
            reload();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${copy.singular}?`}
          message={`This permanently removes "${deleting.title}" from the website. This cannot be undone.`}
          confirmLabel={`Delete ${copy.singular}`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

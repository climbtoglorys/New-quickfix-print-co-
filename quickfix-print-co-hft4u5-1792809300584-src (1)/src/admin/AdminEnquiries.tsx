import { useState } from 'react';
import {
  errMsg,
  formatDate,
  type Enquiry,
  type EnquiryStatus,
} from '../lib/core';
import { deleteEnquiry, fetchEnquiries, setEnquiryStatus } from '../lib/data';
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  NoticeBar,
  Spinner,
  useLoad,
  useNotice,
} from '../components/ui';
import { Trash2 } from 'lucide-react';

const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'handled', label: 'Handled' },
];

export default function AdminEnquiries() {
  const { data, loading, error, reload } = useLoad(fetchEnquiries, []);
  const { notice, setNotice } = useNotice();
  const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');
  const [deleting, setDeleting] = useState<Enquiry | null>(null);
  const [busy, setBusy] = useState(false);

  const all = data ?? [];
  const list = all.filter(e => filter === 'all' || e.status === filter);
  const newCount = all.filter(e => e.status === 'new').length;

  const changeStatus = async (id: string, status: EnquiryStatus) => {
    try {
      await setEnquiryStatus(id, status);
      reload();
    } catch (e) {
      setNotice({ type: 'error', text: errMsg(e) });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteEnquiry(deleting.id);
      setNotice({ type: 'success', text: 'Enquiry deleted.' });
      setDeleting(null);
      reload();
    } catch (e) {
      setNotice({ type: 'error', text: errMsg(e) });
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <h1>Enquiries</h1>
          <p className="muted">
            Messages sent through the website contact form. Only administrators
            can see these.
          </p>
        </div>
      </div>

      <NoticeBar notice={notice} onClose={() => setNotice(null)} />

      <div className="admin-filters">
        <div className="field">
          <label htmlFor="enquiry-filter">Show</label>
          <select
            id="enquiry-filter"
            className="input"
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | EnquiryStatus)}
          >
            <option value="all">All enquiries</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <p className="result-count" aria-live="polite">
          {newCount} new of {all.length} total
        </p>
      </div>

      {loading && !data && <Spinner label="Loading enquiries" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && list.length === 0 && (
        <EmptyState title="No enquiries to show." />
      )}

      {list.length > 0 && (
        <ul className="enquiry-list">
          {list.map(e => (
            <li key={e.id} className="enquiry-card">
              <div className="enquiry-head">
                <div>
                  <strong>{e.full_name}</strong>
                  <span className="muted small">
                    {' '}
                    \u00b7 {formatDate(e.created_at)}
                  </span>
                </div>
                <div className="enquiry-controls">
                  <label htmlFor={`status-${e.id}`} className="sr-only">
                    Status for {e.full_name}
                  </label>
                  <select
                    id={`status-${e.id}`}
                    className="input input-sm"
                    value={e.status}
                    onChange={ev =>
                      changeStatus(e.id, ev.target.value as EnquiryStatus)
                    }
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => setDeleting(e)}
                    aria-label={`Delete enquiry from ${e.full_name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" /> Delete
                  </button>
                </div>
              </div>
              <p className="enquiry-meta">
                <a href={`tel:${e.phone.replace(/[^0-9+]/g, '')}`}>{e.phone}</a>
                {e.email && (
                  <>
                    {' \u00b7 '}
                    <a href={`mailto:${e.email}`}>{e.email}</a>
                  </>
                )}
                {e.enquiry_category && ` \u00b7 ${e.enquiry_category}`}
                {e.product_reference &&
                  ` \u00b7 Product: ${e.product_reference}`}
              </p>
              <p className="enquiry-message">{e.message}</p>
            </li>
          ))}
        </ul>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete enquiry?"
          message={`This permanently deletes the enquiry from ${deleting.full_name}. This cannot be undone.`}
          confirmLabel="Delete enquiry"
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

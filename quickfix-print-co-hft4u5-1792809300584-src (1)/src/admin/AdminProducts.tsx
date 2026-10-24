import { useMemo, useRef, useState, type FormEvent } from 'react';
import {
  AVAILABILITY_OPTIONS,
  CATEGORIES,
  categoryLabel,
  errMsg,
  priceLabel,
  slugify,
  type Availability,
  type Product,
  type ProductCategory,
  type ProductInput,
  type PriceMode,
} from '../lib/core';
import {
  BUCKETS,
  deleteProduct,
  fetchProducts,
  removeStoredImage,
  saveProduct,
  uploadImage,
} from '../lib/data';
import { SafeImage, CategoryIllustration } from '../components/art';
import { ProductCard } from '../components/ProductCard';
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
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';

interface FormState {
  name: string;
  category: ProductCategory;
  model_code: string;
  short_description: string;
  full_description: string;
  image_url: string;
  price_amount: string;
  currency: string;
  price_display_mode: PriceMode;
  availability: Availability;
  featured: boolean;
  is_demo: boolean;
}

function toForm(p: Product | null): FormState {
  return {
    name: p?.name ?? '',
    category: p?.category ?? 'printing-machines',
    model_code: p?.model_code ?? '',
    short_description: p?.short_description ?? '',
    full_description: p?.full_description ?? '',
    image_url: p?.image_url ?? '',
    price_amount:
      p?.price_amount !== null && p?.price_amount !== undefined
        ? String(p.price_amount)
        : '',
    currency: p?.currency ?? 'NGN',
    price_display_mode: p?.price_display_mode ?? 'contact-for-price',
    availability: p?.availability ?? 'to-be-confirmed',
    featured: p?.featured ?? false,
    is_demo: p?.is_demo ?? false,
  };
}

function validateForm(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'Product name is required.';
  else if (f.name.trim().length > 200)
    e.name = 'Keep the name under 200 characters.';
  if (f.model_code.length > 100)
    e.model_code = 'Keep this under 100 characters.';
  if (f.short_description.length > 400)
    e.short_description = 'Keep this under 400 characters.';
  if (f.full_description.length > 5000)
    e.full_description = 'Keep this under 5000 characters.';
  if (f.image_url.trim()) {
    if (!/^https?:\/\//i.test(f.image_url.trim()))
      e.image_url = 'Image link must start with http:// or https://';
    else if (f.image_url.trim().length > 1000)
      e.image_url = 'Image link is too long.';
  }
  if (f.price_amount.trim() !== '') {
    const n = Number(f.price_amount);
    if (Number.isNaN(n) || n < 0)
      e.price_amount = 'Enter a valid price (0 or more).';
  } else if (f.price_display_mode === 'show-price') {
    e.price_amount = 'Enter a price, or switch to "Contact for price".';
  }
  if (!/^[A-Za-z]{3}$/.test(f.currency.trim()))
    e.currency = 'Use a 3-letter currency code, such as NGN.';
  return e;
}

function ProductForm({
  product,
  onCancel,
  onSaved,
}: {
  product: Product | null;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [form, setForm] = useState<FormState>(toForm(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFormError(null);
    setUploading(true);
    try {
      const url = await uploadImage(BUCKETS.products, file);
      update('image_url', url);
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const preview: Product = useMemo(
    () => ({
      id: product?.id ?? 'preview',
      name: form.name.trim() || 'Product name',
      slug: product?.slug ?? 'preview',
      category: form.category,
      model_code: form.model_code.trim() || null,
      short_description: form.short_description.trim() || null,
      full_description: form.full_description.trim() || null,
      image_url: form.image_url.trim() || null,
      price_amount:
        form.price_amount.trim() === '' ||
        Number.isNaN(Number(form.price_amount))
          ? null
          : Number(form.price_amount),
      currency: form.currency.trim().toUpperCase() || 'NGN',
      price_display_mode: form.price_display_mode,
      availability: form.availability,
      featured: form.featured,
      is_demo: form.is_demo,
      created_at: '',
      updated_at: '',
    }),
    [form, product]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
    setFormError(null);
    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: ProductInput = {
      name: form.name.trim(),
      slug: product?.slug ?? slugify(form.name),
      category: form.category,
      model_code: form.model_code.trim() || null,
      short_description: form.short_description.trim() || null,
      full_description: form.full_description.trim() || null,
      image_url: form.image_url.trim() || null,
      price_amount:
        form.price_amount.trim() === '' ? null : Number(form.price_amount),
      currency: form.currency.trim().toUpperCase(),
      price_display_mode: form.price_display_mode,
      availability: form.availability,
      featured: form.featured,
      is_demo: form.is_demo,
    };

    setSaving(true);
    try {
      await saveProduct(product?.id ?? null, input);
      if (
        product &&
        product.image_url &&
        product.image_url !== input.image_url
      ) {
        await removeStoredImage(BUCKETS.products, product.image_url);
      }
      onSaved(product ? 'Product updated.' : 'Product added.');
    } catch (err) {
      setFormError(errMsg(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={product ? 'Edit product' : 'Add product'}
      onClose={onCancel}
      wide
    >
      <form onSubmit={onSubmit} noValidate className="product-form">
        {formError && (
          <div className="notice notice-error" role="alert">
            <span>{formError}</span>
          </div>
        )}
        <div className="form-cols">
          <div className="form-main">
            <div className="field">
              <label htmlFor="p-name">Product name *</label>
              <input
                id="p-name"
                className="input"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="p-category">Category *</label>
                <select
                  id="p-category"
                  className="input"
                  value={form.category}
                  onChange={e =>
                    update('category', e.target.value as ProductCategory)
                  }
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-model">Model / part code</label>
                <input
                  id="p-model"
                  className="input"
                  value={form.model_code}
                  onChange={e => update('model_code', e.target.value)}
                  aria-invalid={Boolean(errors.model_code)}
                />
                {errors.model_code && (
                  <p className="field-error">{errors.model_code}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="p-short">Short description</label>
              <textarea
                id="p-short"
                className="input textarea"
                rows={2}
                value={form.short_description}
                onChange={e => update('short_description', e.target.value)}
                aria-invalid={Boolean(errors.short_description)}
              />
              {errors.short_description && (
                <p className="field-error">{errors.short_description}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="p-full">Full description</label>
              <textarea
                id="p-full"
                className="input textarea"
                rows={5}
                value={form.full_description}
                onChange={e => update('full_description', e.target.value)}
                aria-invalid={Boolean(errors.full_description)}
              />
              <p className="help">
                Only include specifications and compatibility you have verified.
              </p>
              {errors.full_description && (
                <p className="field-error">{errors.full_description}</p>
              )}
            </div>

            <div className="field">
              <span className="label">Image</span>
              <div className="upload-row">
                <input
                  ref={fileRef}
                  id="p-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={e => onFile(e.target.files?.[0])}
                />
                <label htmlFor="p-file" className="btn btn-outline btn-sm">
                  <Upload size={16} aria-hidden="true" />{' '}
                  {uploading ? 'Uploading...' : 'Upload image'}
                </label>
                {form.image_url && (
                  <button
                    type="button"
                    className="btn btn-ghost-dark btn-sm"
                    onClick={() => update('image_url', '')}
                  >
                    Remove image
                  </button>
                )}
              </div>
              <label htmlFor="p-image" className="help">
                Or paste an image link
              </label>
              <input
                id="p-image"
                className="input"
                value={form.image_url}
                onChange={e => update('image_url', e.target.value)}
                placeholder="https://"
                aria-invalid={Boolean(errors.image_url)}
              />
              {errors.image_url && (
                <p className="field-error">{errors.image_url}</p>
              )}
              <p className="help">JPG, PNG or WebP, up to 5 MB.</p>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="p-price-mode">Price display</label>
                <select
                  id="p-price-mode"
                  className="input"
                  value={form.price_display_mode}
                  onChange={e =>
                    update('price_display_mode', e.target.value as PriceMode)
                  }
                >
                  <option value="contact-for-price">Contact for price</option>
                  <option value="show-price">Show price</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-price">Confirmed price</label>
                <input
                  id="p-price"
                  className="input"
                  inputMode="decimal"
                  value={form.price_amount}
                  onChange={e => update('price_amount', e.target.value)}
                  aria-invalid={Boolean(errors.price_amount)}
                />
                {errors.price_amount && (
                  <p className="field-error">{errors.price_amount}</p>
                )}
              </div>
              <div className="field field-narrow">
                <label htmlFor="p-currency">Currency</label>
                <input
                  id="p-currency"
                  className="input"
                  value={form.currency}
                  maxLength={3}
                  onChange={e =>
                    update('currency', e.target.value.toUpperCase())
                  }
                  aria-invalid={Boolean(errors.currency)}
                />
                {errors.currency && (
                  <p className="field-error">{errors.currency}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="p-availability">Availability</label>
              <select
                id="p-availability"
                className="input"
                value={form.availability}
                onChange={e =>
                  update('availability', e.target.value as Availability)
                }
              >
                {AVAILABILITY_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <p className="help">
                Only set "In stock" or "Out of stock" once you have checked.
              </p>
            </div>

            <div className="check-row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => update('featured', e.target.checked)}
                />
                <span>Featured on the home page</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.is_demo}
                  onChange={e => update('is_demo', e.target.checked)}
                />
                <span>Sample listing (shows a "Sample listing" label)</span>
              </label>
            </div>
          </div>

          <aside className="form-preview" aria-label="Preview">
            <h3>Preview</h3>
            <ProductCard product={preview} preview />
            <p className="help">Price shown: {priceLabel(preview)}</p>
          </aside>
        </div>

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
            {saving ? 'Saving...' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminProducts() {
  const { data, loading, error, reload } = useLoad(fetchProducts, []);
  const { notice, setNotice } = useNotice();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | ProductCategory>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.model_code ?? '').toLowerCase().includes(term)
      );
    });
  }, [data, q, cat]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteProduct(deleting.id);
      await removeStoredImage(BUCKETS.products, deleting.image_url);
      setNotice({ type: 'success', text: `Deleted "${deleting.name}".` });
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
          <h1>Products</h1>
          <p className="muted">
            Add, edit, or remove the products shown on the website.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setAdding(true)}
        >
          <Plus size={18} aria-hidden="true" /> Add product
        </button>
      </div>

      <NoticeBar notice={notice} onClose={() => setNotice(null)} />

      <div className="admin-filters">
        <div className="field field-grow">
          <label htmlFor="admin-product-search">Search products</label>
          <div className="input-icon">
            <Search size={18} aria-hidden="true" />
            <input
              id="admin-product-search"
              type="search"
              className="input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Name or model/code"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="admin-product-cat">Category</label>
          <select
            id="admin-product-cat"
            className="input"
            value={cat}
            onChange={e => setCat(e.target.value as 'all' | ProductCategory)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !data && <Spinner label="Loading products" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <p className="result-count" aria-live="polite">
            {list.length} of {data.length} products
          </p>
          {list.length === 0 ? (
            <EmptyState
              title="No products found."
              text="Add a product or change your search."
            />
          ) : (
            <ul className="admin-list">
              {list.map(p => (
                <li key={p.id} className="admin-row">
                  <div className="admin-thumb">
                    <SafeImage
                      src={p.image_url}
                      alt={p.name}
                      fallback={
                        <div className="ph">
                          <CategoryIllustration category={p.category} />
                        </div>
                      }
                    />
                  </div>
                  <div className="admin-row-main">
                    <strong>{p.name}</strong>
                    <span className="muted small">
                      {categoryLabel(p.category)}
                      {p.model_code
                        ? ` \u00b7 ${p.model_code}`
                        : ''} \u00b7 {priceLabel(p)}
                    </span>
                    <span className="tag-row">
                      <span className={`badge badge-${p.availability}`}>
                        {
                          AVAILABILITY_OPTIONS.find(
                            a => a.value === p.availability
                          )?.label
                        }
                      </span>
                      {p.featured && (
                        <span className="badge badge-featured">Featured</span>
                      )}
                      {p.is_demo && (
                        <span className="badge badge-sample">Sample</span>
                      )}
                    </span>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditing(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={15} aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {(adding || editing) && (
        <ProductForm
          product={editing}
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
          title="Delete product?"
          message={`This permanently removes "${deleting.name}" from the website. This cannot be undone.`}
          confirmLabel="Delete product"
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link, navigate, type Route } from '../lib/router';
import {
  AVAILABILITY_OPTIONS,
  BUSINESS,
  CATEGORIES,
  categoryLabel,
  isCategory,
  priceLabel,
  productMessage,
  whatsappLink,
  type Availability,
  type Product,
} from '../lib/core';
import { fetchProductBySlug, fetchProducts, fetchRelated } from '../lib/data';
import { ContactBand, useMeta } from '../components/Layout';
import { ProductImage } from '../components/art';
import { AvailabilityBadge, ProductCard } from '../components/ProductCard';
import { EmptyState, ErrorState, Spinner, useLoad } from '../components/ui';
import { ArrowRight, MessageCircle, Phone, Search } from 'lucide-react';

type Sort = 'recent' | 'name';

export function Products({ route }: { route: Route }) {
  useMeta(
    'Products | Quickfix Print & Co',
    'Browse printing machines, toner cartridges, consumables, and printer spare parts from Quickfix Print & Co in Abuja.'
  );
  const { data, loading, error, reload } = useLoad(fetchProducts, []);
  const [q, setQ] = useState('');
  const [availability, setAvailability] = useState<'all' | Availability>('all');
  const [sort, setSort] = useState<Sort>('recent');

  const categoryParam = route.query.get('category');
  const category = isCategory(categoryParam) ? categoryParam : 'all';

  const all = data ?? [];
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = all.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (availability !== 'all' && p.availability !== availability)
        return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.model_code ?? '').toLowerCase().includes(term)
      );
    });
    if (sort === 'name')
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [all, q, category, availability, sort]);

  const filtersActive =
    q.trim() !== '' ||
    category !== 'all' ||
    availability !== 'all' ||
    sort !== 'recent';
  const hasSamples = all.some(p => p.is_demo);

  const clearFilters = () => {
    setQ('');
    setAvailability('all');
    setSort('recent');
    navigate('products');
  };

  const setCategory = (value: string) => {
    navigate(value === 'all' ? 'products' : `products?category=${value}`);
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Products</h1>
          <p>
            Browse our catalogue, then enquire to confirm price, availability,
            and compatibility.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {hasSamples && (
            <p className="info-note">
              Some listings are sample entries that show how the catalogue
              works. Please confirm every detail with Quickfix Print &amp; Co
              before you rely on it.
            </p>
          )}

          <div className="chips" role="group" aria-label="Product categories">
            <button
              type="button"
              className={category === 'all' ? 'chip is-active' : 'chip'}
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              All Products
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                className={category === c.value ? 'chip is-active' : 'chip'}
                aria-pressed={category === c.value}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <form
            className="filters"
            role="search"
            onSubmit={e => e.preventDefault()}
          >
            <div className="field field-grow">
              <label htmlFor="product-search">
                Search by name or model/code
              </label>
              <div className="input-icon">
                <Search size={18} aria-hidden="true" />
                <input
                  id="product-search"
                  type="search"
                  className="input"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="e.g. toner or a model code"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="availability-filter">Availability</label>
              <select
                id="availability-filter"
                className="input"
                value={availability}
                onChange={e =>
                  setAvailability(e.target.value as 'all' | Availability)
                }
              >
                <option value="all">Any availability</option>
                {AVAILABILITY_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sort-select">Sort by</label>
              <select
                id="sort-select"
                className="input"
                value={sort}
                onChange={e => setSort(e.target.value as Sort)}
              >
                <option value="recent">Recently added</option>
                <option value="name">Name (A to Z)</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={clearFilters}
              disabled={!filtersActive}
            >
              Clear filters
            </button>
          </form>

          {loading && !data && <Spinner label="Loading products" />}
          {error && <ErrorState message={error} onRetry={reload} />}

          {data && (
            <>
              <p className="result-count" aria-live="polite">
                Showing {results.length} of {all.length} products
              </p>
              {results.length === 0 ? (
                <EmptyState
                  title="No products match your search."
                  text="Try a different name or model, or clear the filters. You can also contact us to ask about a product that is not listed."
                  action={
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  }
                />
              ) : (
                <ul className="grid grid-4">
                  {results.map(p => (
                    <li key={p.id}>
                      <ProductCard product={p} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
      <ContactBand />
    </>
  );
}

function DetailBody({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  useMeta(
    `${product.name} | Quickfix Print & Co`,
    product.short_description
      ? `${product.short_description} Enquire with Quickfix Print & Co in Area 10, Garki, Abuja.`
      : `Enquire about ${product.name} from Quickfix Print & Co in Area 10, Garki, Abuja.`
  );
  const wa = whatsappLink(productMessage(product.name, product.model_code));
  const reference = product.model_code
    ? `${product.name} ${product.model_code}`
    : product.name;

  return (
    <>
      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to="products">Products</Link>
            <span aria-hidden="true"> / </span>
            <Link to={`products?category=${product.category}`}>
              {categoryLabel(product.category)}
            </Link>
          </nav>

          <div className="detail-grid">
            <div className="detail-media">
              <ProductImage
                src={product.image_url}
                name={product.name}
                category={product.category}
              />
            </div>
            <div className="detail-info">
              {product.is_demo && (
                <span className="badge badge-sample">
                  Sample listing \u2014 confirm with Quickfix
                </span>
              )}
              <p className="product-cat">{categoryLabel(product.category)}</p>
              <h1>{product.name}</h1>
              {product.model_code && (
                <p className="product-code">
                  Model / part code: {product.model_code}
                </p>
              )}
              <p className="detail-price">{priceLabel(product)}</p>
              <AvailabilityBadge value={product.availability} />

              <h2 className="detail-sub">Description</h2>
              <p className="detail-text">
                {product.full_description ||
                  product.short_description ||
                  'Contact us for details about this product.'}
              </p>

              <div className="compat-note">
                Please contact Quickfix Print &amp; Co to confirm compatibility
                with your machine.
              </div>

              <div className="detail-actions">
                <a
                  className="btn btn-wa btn-lg"
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Enquire on
                  WhatsApp
                </a>
                {BUSINESS.phones.map(p => (
                  <a key={p.tel} className="btn btn-navy" href={`tel:${p.tel}`}>
                    <Phone size={18} aria-hidden="true" /> Call {p.display}
                  </a>
                ))}
              </div>
              <p className="muted small">
                Prefer a form?{' '}
                <Link to={`contact?product=${encodeURIComponent(reference)}`}>
                  Send an enquiry about this product
                </Link>
                .
              </p>
              <Link to="products" className="back-link">
                &larr; Back to all products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section
          className="section section-tint"
          aria-labelledby="related-title"
        >
          <div className="container">
            <div className="section-head">
              <h2 id="related-title">Related products</h2>
            </div>
            <ul className="grid grid-3">
              {related.map(p => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <ContactBand />
    </>
  );
}

export function ProductDetail({ slug }: { slug: string }) {
  const { data, loading, error, reload } = useLoad(async () => {
    const product = await fetchProductBySlug(slug);
    if (!product) return { product: null, related: [] as Product[] };
    const related = await fetchRelated(product.category, product.id);
    return { product, related };
  }, [slug]);

  useMeta(
    'Product | Quickfix Print & Co',
    'Product details from Quickfix Print & Co in Area 10, Garki, Abuja.'
  );

  if (loading && !data) {
    return (
      <section className="section">
        <div className="container">
          <Spinner label="Loading product" />
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState message={error} onRetry={reload} />
        </div>
      </section>
    );
  }
  if (!data || !data.product) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            title="We could not find that product."
            text="It may have been removed or the link may be incorrect."
            action={
              <Link to="products" className="btn btn-primary">
                Browse products <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
        </div>
      </section>
    );
  }
  return <DetailBody product={data.product} related={data.related} />;
}

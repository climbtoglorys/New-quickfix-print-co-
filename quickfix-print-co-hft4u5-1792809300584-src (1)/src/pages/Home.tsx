import { Link } from '../lib/router';
import { GENERAL_MESSAGE, whatsappLink } from '../lib/core';
import { fetchProducts } from '../lib/data';
import { ContactBand, useMeta } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ErrorState, Spinner, useLoad } from '../components/ui';
import { ShowcaseSection } from './Showcase';
import { ArrowRight, MessageCircle } from 'lucide-react';

const WHY = [
  'Printing equipment and supplies across relevant categories.',
  'An Abuja-based business location in Area 10, Garki.',
  'Customers can enquire about product details and compatibility.',
  'Direct telephone and WhatsApp contact.',
];

const STEPS = [
  {
    title: 'Browse the catalogue',
    text: 'Look through printing machines, toners, consumables, and spare parts.',
  },
  {
    title: 'Select a product',
    text: 'Open a product to see its details and listing information.',
  },
  {
    title: 'Enquire by WhatsApp or telephone',
    text: 'Send us the product name or your printer model.',
  },
  {
    title: 'Confirm the details',
    text: 'Confirm price, stock, compatibility, and delivery or collection arrangements directly with the business.',
  },
];

export default function Home() {
  useMeta(
    'Quickfix Print & Co | Printing Supplies in Abuja',
    'Enquire about printing equipment, toners, consumables, and printer parts from Quickfix Print & Co in Area 10, Garki, Abuja.'
  );
  const { data, loading, error, reload } = useLoad(fetchProducts, []);
  const featured = (data ?? []).filter(p => p.featured).slice(0, 4);
  const wa = whatsappLink(GENERAL_MESSAGE);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Reliable Printing Solutions for Your Business</h1>
            <p>
              Explore printing machines, toners, consumables, and related
              supplies for your business. Contact Quickfix Print &amp; Co to
              enquire about availability, pricing, and product compatibility.
            </p>
            <div className="hero-actions">
              <Link to="products" className="btn btn-primary btn-lg">
                Explore Products <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                className="btn btn-wa btn-lg"
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} aria-hidden="true" /> Enquire on
                WhatsApp
              </a>
            </div>
          </div>
          <div className="hero-art">
            <img
              className="hero-photo"
              src="/resources/quickfix-team.jpg"
              alt="Four members of the Quickfix Print and Co team smiling together in the office"
              width={1024}
              height={1024}
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
      </section>

      <section
        className="section section-tint"
        aria-labelledby="featured-title"
      >
        <div className="container">
          <div className="section-head section-head-row">
            <div>
              <h2 id="featured-title">Featured products</h2>
              <p>
                Listings marked "Sample listing" are examples until the business
                confirms its stock.
              </p>
            </div>
            <Link to="products" className="btn btn-outline btn-sm">
              View all products <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {loading && !data && <Spinner label="Loading products" />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {data && featured.length === 0 && (
            <p className="muted">
              Browse the full catalogue to see the products currently listed.
            </p>
          )}
          {featured.length > 0 && (
            <ul className="grid grid-4">
              {featured.map(p => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="about-title">
        <div className="container split">
          <div>
            <h2 id="about-title">About Quickfix</h2>
            <p>
              Quickfix Print &amp; Co supplies printing equipment, toners,
              consumables, and related printing supplies. Based in Area 10,
              Garki, Abuja, the business helps customers enquire about products
              for their printing needs.
            </p>
            <Link to="about" className="btn btn-outline">
              Read more about us
            </Link>
          </div>
          <div className="why-card">
            <h3>Why enquire with Quickfix?</h3>
            <ul className="check-list">
              {WHY.map(w => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head">
            <h2 id="how-title">How ordering works</h2>
            <p>
              Orders start with a simple enquiry. Price and stock are confirmed
              with the business.
            </p>
          </div>
          <ol className="grid grid-4 steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step-card">
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ShowcaseSection kind="work" />
      <ShowcaseSection kind="client" tinted />

      <ContactBand />
    </>
  );
}

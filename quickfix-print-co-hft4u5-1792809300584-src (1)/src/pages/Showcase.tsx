import { fetchShowcase } from '../lib/data';
import type { ShowcaseItem, ShowcaseKind } from '../lib/core';
import { Link } from '../lib/router';
import Slider from '../components/Slider';
import { SafeImage, PrinterIllustration } from '../components/art';
import { ContactBand, useMeta } from '../components/Layout';
import { EmptyState, ErrorState, Spinner, useLoad } from '../components/ui';
import { ArrowRight } from 'lucide-react';

function WorkSlide({ item }: { item: ShowcaseItem }) {
  return (
    <article className="work-card">
      <div className="work-media">
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
      <div className="work-body">
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
      </div>
    </article>
  );
}

function ClientSlide({ item }: { item: ShowcaseItem }) {
  return (
    <article className="client-card">
      <div className="client-media">
        <SafeImage
          src={item.image_url}
          alt={`${item.title} logo`}
          fallback={
            <span className="client-initial">
              {item.title.slice(0, 1).toUpperCase()}
            </span>
          }
        />
      </div>
      <h3>{item.title}</h3>
      {item.description && <p>{item.description}</p>}
    </article>
  );
}

const COPY = {
  work: {
    heading: 'Our Work',
    intro:
      'A selection of past work from Quickfix Print & Co. Swipe or use the arrows to browse.',
    label: 'Our work slideshow',
    empty: 'No work has been published yet.',
    emptyText: 'Past work will appear here once it has been added.',
    to: '/works',
  },
  client: {
    heading: 'Our Clients',
    intro:
      'Businesses and organisations we have worked with. Swipe or use the arrows to browse.',
    label: 'Our clients slideshow',
    empty: 'No clients have been published yet.',
    emptyText: 'Clients will appear here once they have been added.',
    to: '/clients',
  },
} as const;

export function ShowcaseSlider({ kind }: { kind: ShowcaseKind }) {
  const copy = COPY[kind];
  const { data, loading, error, reload } = useLoad(
    () => fetchShowcase(kind, true),
    [kind]
  );

  if (loading && !data) return <Spinner label="Loading" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const items = data ?? [];
  if (items.length === 0)
    return <EmptyState title={copy.empty} text={copy.emptyText} />;

  return (
    <Slider
      label={copy.label}
      variant={kind}
      items={items.map(item =>
        kind === 'work' ? (
          <WorkSlide key={item.id} item={item} />
        ) : (
          <ClientSlide key={item.id} item={item} />
        )
      )}
    />
  );
}

export function ShowcaseSection({
  kind,
  tinted = false,
}: {
  kind: ShowcaseKind;
  tinted?: boolean;
}) {
  const copy = COPY[kind];
  const titleId = `showcase-${kind}-title`;
  return (
    <section
      className={tinted ? 'section section-tint' : 'section'}
      aria-labelledby={titleId}
    >
      <div className="container">
        <div className="section-head section-head-row">
          <div>
            <h2 id={titleId}>{copy.heading}</h2>
            <p>{copy.intro}</p>
          </div>
          <Link to={copy.to} className="btn btn-outline btn-sm">
            View all <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ShowcaseSlider kind={kind} />
      </div>
    </section>
  );
}

export function ShowcasePage({ kind }: { kind: ShowcaseKind }) {
  const copy = COPY[kind];
  useMeta(
    `${copy.heading} | Quickfix Print & Co`,
    kind === 'work'
      ? 'See past work from Quickfix Print & Co, a printing equipment and supplies business in Area 10, Garki, Abuja.'
      : 'See the clients Quickfix Print & Co has worked with, from Area 10, Garki, Abuja.'
  );
  const { data } = useLoad(() => fetchShowcase(kind, true), [kind]);
  const items = data ?? [];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{copy.heading}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ShowcaseSlider kind={kind} />
          {items.length > 0 && (
            <div className="all-items">
              <h2>{kind === 'work' ? 'All work' : 'All clients'}</h2>
              <ul className={kind === 'work' ? 'grid grid-3' : 'grid grid-4'}>
                {items.map(item => (
                  <li key={item.id}>
                    {kind === 'work' ? (
                      <WorkSlide item={item} />
                    ) : (
                      <ClientSlide item={item} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <ContactBand />
    </>
  );
}

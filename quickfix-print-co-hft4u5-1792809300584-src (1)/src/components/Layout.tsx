import { useEffect, useState } from 'react';
import { Link, type Route } from '../lib/router';
import {
  BUSINESS,
  CATEGORIES,
  GENERAL_MESSAGE,
  whatsappLink,
} from '../lib/core';
import { MapPin, Menu, MessageCircle, Phone, X } from 'lucide-react';

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useMeta(
  title: string,
  description: string,
  opts?: { noindex?: boolean }
) {
  const noindex = opts?.noindex ?? false;
  useEffect(() => {
    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow'
    );
  }, [title, description, noindex]);
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={light ? 'wordmark logo-wordmark logo-wordmark-light' : 'wordmark logo-wordmark'}>
      <img
        className="brand-logo-image"
        src="/resources/quickfix-logo.png"
        alt=""
        aria-hidden="true"
      />
      <span className={light ? 'brand-name brand-name-light' : 'brand-name'}>
        <span className="brand-name-primary">QUICKFIX</span>
        <span className="brand-name-secondary">PRINT &amp; CO</span>
      </span>
    </span>
  );
}

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/services', label: 'Services' },
  { to: '/works', label: 'Our Work' },
  { to: '/clients', label: 'Clients' },
  { to: '/contact', label: 'Contact' },
];

function isActive(current: string, to: string): boolean {
  if (to === '/') return current === '/';
  return current === to || current.startsWith(`${to}/`);
}

export function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [route.path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const wa = whatsappLink(GENERAL_MESSAGE);

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link
          to=""
          className="brand-link"
          aria-label="Quickfix Print & Co, home page"
        >
          <Wordmark />
        </Link>

        <nav className="nav-desktop" aria-label="Main navigation">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={
                isActive(route.path, item.to)
                  ? 'nav-link is-active'
                  : 'nav-link'
              }
              aria-current={isActive(route.path, item.to) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          className="nav-mobile"
          aria-label="Mobile navigation"
        >
          <div className="container">
            {NAV.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive(route.path, item.to)
                    ? 'mobile-link is-active'
                    : 'mobile-link'
                }
                aria-current={
                  isActive(route.path, item.to) ? 'page' : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const wa = whatsappLink(GENERAL_MESSAGE);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Wordmark light />
          <p className="footer-text">
            Printing equipment, toners, consumables, and related supplies for
            businesses.
          </p>
        </div>
        <div>
          <h2 className="footer-title">Pages</h2>
          <ul className="footer-list">
            {NAV.map(item => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Products</h2>
          <ul className="footer-list">
            {CATEGORIES.map(c => (
              <li key={c.value}>
                <Link to={`products?category=${c.value}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Contact</h2>
          <ul className="footer-list">
            {BUSINESS.phones.map(p => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`}>
                  <Phone size={15} aria-hidden="true" /> {p.display}
                </a>
              </li>
            ))}
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} aria-hidden="true" /> Enquire on
                WhatsApp
              </a>
            </li>
            <li className="footer-address">
              <MapPin size={15} aria-hidden="true" /> {BUSINESS.address}
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-row">
          <span>
            &copy; {new Date().getFullYear()} {BUSINESS.name}. Registration
            number: {BUSINESS.registration}
          </span>
          <span className="footer-links">
            <Link to="privacy">Privacy Policy</Link>
            <Link to="admin">Staff login</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function ContactBand() {
  const wa = whatsappLink(GENERAL_MESSAGE);
  return (
    <section className="band" aria-labelledby="contact-band-title">
      <div className="container band-inner">
        <div>
          <h2 id="contact-band-title">Talk to Quickfix Print &amp; Co</h2>
          <p>
            Call or message us to confirm price, availability, and
            compatibility.
            <br />
            <MapPin size={16} aria-hidden="true" className="inline-icon" />{' '}
            {BUSINESS.address}
          </p>
        </div>
        <div className="band-actions">
          {BUSINESS.phones.map(p => (
            <a key={p.tel} className="btn btn-light" href={`tel:${p.tel}`}>
              <Phone size={18} aria-hidden="true" /> {p.display}
            </a>
          ))}
          <a
            className="btn btn-wa"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" /> Enquire on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
